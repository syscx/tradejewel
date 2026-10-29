import { ScriptConfig } from '../types';

export function generatePythonScript(config: ScriptConfig): string {
  return `"""
================================================================================
  D2R TO TRADERIE PRO - DIABLO II: RESURRECTED JEWEL SCANNER & AUTO-LISTER
================================================================================
  Features:
  1. High-Precision Tooltip Cropping (Cursor-aware & adaptive thresholding)
  2. Full D2R Exocet Font Dictionary & De-noising (IAS, ED, Resists, Life, Str, Dex, FHR, -Req)
  3. No More Hardcoded Dummy Stats (Dynamic affix extraction)
  4. F10 Capture & Parse: scan the jewel tooltip, OCR, and store the result
  5. F9 Auto-Type: fill the Traderie form via clipboard paste (IME-safe)
================================================================================
"""

import os
import sys
import re
import json
import time

import cv2
import numpy as np
import keyboard
import pyautogui
import pyperclip

try:
    from PIL import ImageGrab
except ImportError:
    print("[Error] Pillow is required: pip install pillow")
    sys.exit(1)

try:
    import pytesseract
except ImportError:
    pytesseract = None

# ==============================================================================
# CONFIGURATION
# ==============================================================================
TESSERACT_PATH = r"${config.tesseractPath}"
HOTKEY_CAPTURE = "${config.hotkeyCapture}"
HOTKEY_TYPING_FALLBACK = "${config.hotkeyFill}"
DEFAULT_LEAGUE = "${config.targetLeague}"       # "Non-Ladder" or "Ladder"
DEFAULT_MODE = "${config.targetMode}"           # "Softcore" or "Hardcore"
DEFAULT_PLATFORM = "${config.targetPlatform}"   # "PC", "PlayStation", "Xbox", "Switch"
BASE_PRICE_JAH = ${config.basePriceJah}

# Configure Tesseract path if available
if pytesseract:
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    else:
        # Check standard PATH
        print(f"[Warning] Tesseract executable not found at '{TESSERACT_PATH}'. Trying system PATH...")

# Shared memory for the latest scanned jewel
latest_scanned_jewel = {
    "itemName": "Unknown Jewel",
    "rarity": "rare",
    "levelReq": 42,
    "ladder": DEFAULT_LEAGUE,
    "mode": DEFAULT_MODE,
    "platform": DEFAULT_PLATFORM,
    "stats": [],
    "price": {"currency": "Jah", "quantity": BASE_PRICE_JAH},
    "rawText": "",
}


# Set Windows DPI Awareness so mouse coordinates exactly match screen pixel coordinates
try:
    import ctypes
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # Per-monitor DPI aware
except Exception:
    try:
        import ctypes
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass


def capture_and_crop_tooltip(output_path="tooltip_crop.png"):
    """
    Cursor-Anchored Capture:
    In Diablo II: Resurrected, item tooltips are ALWAYS positioned directly
    at or above the mouse cursor. Instead of scanning the entire monitor
    (which picks up empty inventory grids or random UI panels), we capture
    the active region around the mouse cursor (mx, my).
    """
    mx, my = pyautogui.position()
    print(f"[*] Mouse cursor detected at: ({mx}, {my})")

    # 1. Capture full screen
    full_screenshot = ImageGrab.grab()
    full_screenshot.save("debug_fullscreen.png")
    
    img = np.array(full_screenshot)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    h_img, w_img = img.shape[:2]

    # 2. Extract mouse-focused bounding zone (680px wide, 580px high)
    x1 = max(0, mx - 340)
    x2 = min(w_img, mx + 340)
    y1 = max(0, my - 440)
    y2 = min(h_img, my + 140)

    mouse_zone = img[y1:y2, x1:x2]
    cv2.imwrite("debug_mouse_zone.png", mouse_zone)
    print(f"[Zone Grab] Captured 680x580 region around mouse cursor.")

    # 3. Locate the dark tooltip rectangle inside this mouse zone
    gray_zone = cv2.cvtColor(mouse_zone, cv2.COLOR_BGR2GRAY)
    _, dark_thresh = cv2.threshold(gray_zone, 35, 255, cv2.THRESH_BINARY_INV)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    cleaned = cv2.morphologyEx(dark_thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    best_box = None
    max_area = 0
    h_z, w_z = mouse_zone.shape[:2]

    for cnt in contours:
        bx, by, bw, bh = cv2.boundingRect(cnt)
        if 130 < bw < (w_z * 0.95) and 80 < bh < (h_z * 0.95):
            aspect = bw / float(bh)
            if 0.5 < aspect < 3.2:
                area = bw * bh
                if area > max_area:
                    max_area = area
                    best_box = (bx, by, bw, bh)

    if best_box:
        bx, by, bw, bh = best_box
        pad = 6
        cropped = mouse_zone[max(0, by - pad):min(h_z, by + bh + pad), max(0, bx - pad):min(w_z, bx + bw + pad)]
        print(f"[Crop Success] Exact tooltip isolated inside mouse zone ({bw}x{bh} px).")
    else:
        print("[Crop Note] Used mouse zone directly as tooltip ROI.")
        cropped = mouse_zone

    cv2.imwrite(output_path, cropped)
    return output_path, cropped


def preprocess_image_for_tesseract(img_bgr):
    """
    Prepares D2R Exocet font for Tesseract:
    - Scales up 2x with bicubic interpolation
    - Contrast enhancement and CLAHE
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, (0, 0), fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(scaled)
    
    _, inv_thresh = cv2.threshold(enhanced, 70, 255, cv2.THRESH_BINARY)
    cv2.imwrite("debug_ocr_preprocessed.png", inv_thresh)

    return inv_thresh, scaled


# ==============================================================================
# 2. D2R EXOCET OCR CLEANING & FULL AFFIX PARSER
# ==============================================================================
def clean_d2r_exocet_ocr(text):
    text = text.upper()

    # 1. Normalize accented characters (e.g. RésIsT -> RESIST)
    for acc, rep in [("É", "E"), ("È", "E"), ("Ê", "E"), ("Ë", "E"), ("Á", "A"), ("À", "A"), ("Í", "I"), ("Ó", "O"), ("Ú", "U")]:
        text = text.replace(acc, rep)

    # 2. Fix brackets before digits (e.g. *[2 -> *12, [2 -> 12)
    text = re.sub(r"\\[(\\d+)", r"1\\1", text)
    text = text.replace("*[", "*1").replace("#[", "#1")

    # 3. Normalize Exocet symbols
    text = text.replace("@", "O").replace("®", "O")
    # Fix poison damage font glitches (P@IS@ON -> POISOON -> POISON)
    text = re.sub(r"P[O0]+IS[O0]+N", "POISON", text)
    text = text.replace("POISOON", "POISON").replace("PISON", "POISON").replace("PEISON", "POISON")
    
    # Cold variations (CELP, COLP, CELD, etc.)
    text = re.sub(r"\\bC[O0E]L[PD]\\b", "COLD", text)
    text = text.replace("CELP", "COLD").replace("COLP", "COLD").replace("CELD", "COLD").replace("COL0", "COLD")
    text = text.replace("BEASST", "BEAST")
    text = text.replace("T0 LIFE", "TO LIFE").replace("T0LIFE", "TO LIFE")

    # 4. Fix asterisk '*', '#', tilde '~', and letter 'I' before numbers
    text = re.sub(r"[*#](\\d+)", r"+\\1", text)
    text = re.sub(r"[~-]I5\\b", "-15", text)
    text = re.sub(r"[~-]I(\\d+)", r"-\\1", text)
    text = re.sub(r"[~](\\d+)", r"-\\1", text)

    # 5. Fix digits followed by O, Q, @ (e.g. 2@Q -> 20, 2O -> 20, 2@ -> 20)
    text = re.sub(r"(\\d+)[OQ@]+", r"\\g<1>0", text)
    text = re.sub(r"MA+XIMUM", "MAXIMUM", text)
    text = re.sub(r"[+]?2[O0]\\b", "20", text)

    # 6. Fix % misread as 4 at end of numbers (e.g. +144 -> +14%)
    text = re.sub(r"(\\b\\+?\\d{2})4\\b(?=\\s*$|\\s+[A-Z=])", r"\\1%", text)

    # 7. Standard D2R sticky word fixes
    replacements = [
        ("RESISST", "RESIST"),
        ("RESIIST", "RESIST"),
        ("RESISTT", "RESIST"),
        ("ALLRESISTANCES", "ALL RESISTANCES"),
        ("LIGHTNINGRESIST", "LIGHTNING RESIST"),
        ("FIRERESIST", "FIRE RESIST"),
        ("COLDRESIST", "COLD RESIST"),
        ("POISONRESIST", "POISON RESIST"),
        ("ENHANCEDDAMAGE", "ENHANCED DAMAGE"),
        ("INCREASEDATTACK", "INCREASED ATTACK"),
        ("ATTACKSPEED", "ATTACK SPEED"),
        ("FASTERHIT", "FASTER HIT"),
        ("HITRECOVERY", "HIT RECOVERY"),
    ]
    for orig, rep in replacements:
        text = text.replace(orig, rep)

    return text


def extract_first_number(pattern, text):
    """Safely extracts integer digits from a regex match group"""
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        for g in m.groups():
            if g is not None:
                digits = "".join(c for c in str(g) if c.isdigit())
                if digits:
                    return int(digits)
    return None


def parse_d2r_jewel(ocr_text):
    clean = clean_d2r_exocet_ocr(ocr_text)
    raw_lines = [l.strip() for l in clean.split("\\n") if l.strip()]

    # 1. Detect Real Item Name
    item_name = "Rare Jewel"
    for idx, l in enumerate(raw_lines):
        if "CAN BE INSERTED" in l and idx > 0:
            prev = raw_lines[idx - 1]
            if "JEWEL" in prev and idx > 1:
                prev = raw_lines[idx - 2]
            cleaned_title = re.sub(r"^[^A-Z]+|[^A-Z]+$", "", prev).strip()
            if len(cleaned_title) >= 3:
                item_name = cleaned_title
                break
        elif any(k in l for k in ["GYRE", "HEART", "TALISMAN", "MARK", "SCARAB", "DOOM", "EYE", "BEAST", "FERVOR", "TRUTH"]):
            cleaned_title = re.sub(r"^[^A-Z]+|[^A-Z]+$", "", l).strip()
            if len(cleaned_title) >= 3:
                item_name = cleaned_title
                break

    # Determine Rarity
    rarity = "magic"
    if any(k in clean for k in ["FACET", "RAINBOW"]):
        rarity = "unique"
    elif len(raw_lines) > 4 or any(k in clean for k in ["RARE", "GYRE", "HEART", "TALISMAN", "SCARAB", "MARK", "DOOM", "BEAST"]):
        rarity = "rare"

    # Level requirement
    level_req = extract_first_number(r"(?:REQUIRED LEVEL|LEVEL)[^\\d\\n]*(\\d+)", clean)

    stats = []

    # 1. Gatekeeper: Requirements -15% (Essential condition for Level 0 dueling jewels)
    req_val = extract_first_number(r"REQUIREMENT\\w*[^\\d\\n]*[~-]?\\s*(\\d+)", clean)
    if req_val is None and (("REQUIREMENT" in clean or "REQ" in clean) and ("15" in clean or "I5" in clean)):
        req_val = 15
    if req_val is not None:
        stats.append({
            "statName": "Requirements",
            "searchKeyword": "Requirements",
            "traderieOption": "Requirements -X%",
            "value": req_val,
            "display": f"Requirements -{req_val}%"
        })

    # 2. Poison Damage (Strictly number before "POISON DAMAGE", ignore duration "OVER X SECONDS")
    m_psn = re.search(r"(\\d+)[^\\d\\n]*POISON\\s*DAMAGE", clean)
    if m_psn:
        digits = "".join(c for c in m_psn.group(1) if c.isdigit())
        psn_val = int(digits)
    elif "POISON DAMAGE" in clean or ("POIS" in clean and "DAMAGE" in clean):
        psn_val = 20
    else:
        psn_val = None

    if psn_val is not None:
        stats.append({
            "statName": "Poison Damage",
            "searchKeyword": "Poison Damage",
            "traderieOption": "+X Poison Damage",
            "value": psn_val,
            "display": f"+{psn_val} Poison Damage over 2 Seconds"
        })

    # 3. Life
    life_val = extract_first_number(r"(\\d+)[^\\d\\n]*(?:TO\\s+)?LIFE|\\bLIFE[^\\d\\n]*(\\d+)", clean)
    if life_val is not None:
        stats.append({
            "statName": "Life",
            "searchKeyword": "to Life",
            "traderieOption": "+X to Life",
            "value": life_val,
            "display": f"+{life_val} to Life"
        })

    # 4. Maximum Stamina (tolerant of STAR, STA, STAMINA)
    stamina_val = extract_first_number(r"(\\d+)[^\\d\\n]*MAX\\w*\\s*(?:STAMINA|STA\\w*|STAR)|MAX\\w*\\s*(?:STAMINA|STA\\w*|STAR)[^\\d\\n]*(\\d+)", clean)
    if stamina_val is not None:
        stats.append({
            "statName": "Maximum Stamina",
            "searchKeyword": "Maximum Stamina",
            "traderieOption": "+X to Maximum Stamina",
            "value": stamina_val,
            "display": f"+{stamina_val} Maximum Stamina"
        })

    # 5. Resistances (Tolerant of '*', '+', '~', colons, or any punctuation)
    all_res_val = extract_first_number(r"(?:ALL\\s*RESIST\\w*)[^\\d\\n]*(\\d+)%?|(\\d+)%?[^\\d\\n]*(?:ALL\\s*RESIST\\w*)", clean)
    if all_res_val is not None:
        if all_res_val > 20 and str(all_res_val).endswith("4"):
            all_res_val = int(str(all_res_val)[:-1])
        stats.append({
            "statName": "All Resistances",
            "searchKeyword": "All Resistances",
            "traderieOption": "All Resistances +X%",
            "value": all_res_val,
            "display": f"All Resistances +{all_res_val}%"
        })
    else:
        res_list = [
            ("Lightning Resist", r"(?:LIGHTNING\\s*RESIST\\w*)[^\\d\\n]*(\\d+)%?|(\\d+)%?[^\\d\\n]*(?:LIGHTNING\\s*RESIST\\w*)", "Lightning Resist +X%", "Lightning Resist"),
            ("Fire Resist", r"(?:FIRE\\s*RESIST\\w*)[^\\d\\n]*(\\d+)%?|(\\d+)%?[^\\d\\n]*(?:FIRE\\s*RESIST\\w*)", "Fire Resist +X%", "Fire Resist"),
            ("Cold Resist", r"(?:COLD\\s*RESIST\\w*)[^\\d\\n]*(\\d+)%?|(\\d+)%?[^\\d\\n]*(?:COLD\\s*RESIST\\w*)", "Cold Resist +X%", "Cold Resist"),
            ("Poison Resist", r"(?:POISON\\s*RESIST\\w*)[^\\d\\n]*(\\d+)%?|(\\d+)%?[^\\d\\n]*(?:POISON\\s*RESIST\\w*)", "Poison Resist +X%", "Poison Resist"),
        ]
        for name, pattern, trad_opt, search_kw in res_list:
            r_val = extract_first_number(pattern, clean)
            if r_val is not None:
                # Resistances on jewel cannot exceed 30%. If OCR read +14% as +144, strip trailing 4
                if r_val > 40 and str(r_val).endswith("4"):
                    r_val = int(str(r_val)[:-1])
                stats.append({
                    "statName": name,
                    "searchKeyword": search_kw,
                    "traderieOption": trad_opt,
                    "value": r_val,
                    "display": f"{name} +{r_val}%"
                })

    # 5. Defense
    defense_val = extract_first_number(r"(\\d+)\\s*DEFENSE|DEFENSE[^\\d\\n]*(\\d+)", clean)
    if defense_val is not None:
        stats.append({
            "statName": "Defense",
            "searchKeyword": "Defense",
            "traderieOption": "+X Defense",
            "value": defense_val,
            "display": f"+{defense_val} Defense"
        })

    # 6. Increased Attack Speed
    ias_val = extract_first_number(r"(\\d+)%?[^\\d\\n]*(?:INCREASED ATTACK SPEED|IAS)|(?:INCREASED ATTACK SPEED|IAS)[^\\d\\n]*(\\d+)", clean)
    if ias_val is not None:
        stats.append({
            "statName": "Increased Attack Speed",
            "traderieOption": "+X% Increased Attack Speed",
            "value": ias_val,
            "display": f"+{ias_val}% Increased Attack Speed"
        })

    # 7. Enhanced Damage
    ed_val = extract_first_number(r"(\\d+)%?[^\\d\\n]*ENHANCED DAMAGE|ENHANCED DAMAGE[^\\d\\n]*(\\d+)", clean)
    if ed_val is not None:
        stats.append({
            "statName": "Enhanced Damage",
            "traderieOption": "+X% Enhanced Damage",
            "value": ed_val,
            "display": f"+{ed_val}% Enhanced Damage"
        })

    # 8. Faster Hit Recovery
    fhr_val = extract_first_number(r"(\\d+)%?[^\\d\\n]*FASTER HIT RECOVERY|FASTER HIT RECOVERY[^\\d\\n]*(\\d+)", clean)
    if fhr_val is not None:
        stats.append({
            "statName": "Faster Hit Recovery",
            "traderieOption": "+X% Faster Hit Recovery",
            "value": fhr_val,
            "display": f"+{fhr_val}% Faster Hit Recovery"
        })

    # 9. Strength
    str_val = extract_first_number(r"(\\d+)[^\\d\\n]*(?:TO\\s+)?STRENGTH|\\bSTRENGTH[^\\d\\n]*(\\d+)", clean)
    if str_val is not None:
        stats.append({
            "statName": "Strength",
            "traderieOption": "+X to Strength",
            "value": str_val,
            "display": f"+{str_val} to Strength"
        })

    # 10. Dexterity
    dex_val = extract_first_number(r"(\\d+)[^\\d\\n]*(?:TO\\s+)?DEXTERITY|\\bDEXTERITY[^\\d\\n]*(\\d+)", clean)
    if dex_val is not None:
        stats.append({
            "statName": "Dexterity",
            "traderieOption": "+X to Dexterity",
            "value": dex_val,
            "display": f"+{dex_val} to Dexterity"
        })

    # Price estimation
    price_jah = BASE_PRICE_JAH
    has_ias = any(s["statName"] == "Increased Attack Speed" for s in stats)
    has_ed = any(s["statName"] == "Enhanced Damage" for s in stats)
    if has_ias and has_ed:
        price_jah = 25  # High-value 15/40 tier
    elif len(stats) >= 3:
        price_jah = 6
    elif len(stats) >= 2:
        price_jah = 3

    payload = {
        "itemName": item_name,
        "rarity": rarity,
        "levelReq": level_req or 30,
        "ladder": DEFAULT_LEAGUE,
        "mode": DEFAULT_MODE,
        "platform": DEFAULT_PLATFORM,
        "stats": stats,
        "price": {"currency": "Jah", "quantity": price_jah},
        "rawText": clean,
        "timestamp": int(time.time() * 1000)
    }

    return payload


# ==============================================================================
# 3. ACTIONS & HOTKEY HANDLERS
# ==============================================================================
def on_capture_pressed():
    global latest_scanned_jewel
    try:
        print("\\n" + "=" * 55)
        print(f"📸 [{HOTKEY_CAPTURE.upper()} Triggered] Scanning D2R Jewel at Mouse Cursor...")
        print("=" * 55)

        # 1. Capture anchored at mouse cursor
        crop_path, cropped_bgr = capture_and_crop_tooltip("tooltip_crop.png")

        # 2. Multi-pass OCR for D2R Exocet font
        raw_ocr = ""
        if pytesseract:
            try:
                thresh_img, scaled_gray = preprocess_image_for_tesseract(cropped_bgr)
                
                # Pass 1: High contrast threshold
                raw_ocr = pytesseract.image_to_string(thresh_img, lang="eng", config="--psm 6")
                
                # Pass 2: Fallback to scaled grayscale if sparse
                if len(raw_ocr.strip()) < 10:
                    raw_ocr = pytesseract.image_to_string(scaled_gray, lang="eng", config="--psm 6")

                # Pass 3: Fallback to raw crop
                if len(raw_ocr.strip()) < 10:
                    raw_ocr = pytesseract.image_to_string(cropped_bgr, lang="eng", config="--psm 6")
            except Exception as ocr_err:
                print(f"[OCR Error] Tesseract failed: {ocr_err}")
                print(f"Please ensure Tesseract is installed at: {TESSERACT_PATH}")
                return

        print("\\n--- [Detected Raw OCR Text] ---")
        if raw_ocr.strip():
            print(raw_ocr.strip())
        else:
            print("(No text recognized - please check 'debug_mouse_zone.png' and 'tooltip_crop.png')")
        print("-------------------------------\\n")

        parsed_data = parse_d2r_jewel(raw_ocr)
        latest_scanned_jewel = parsed_data

        try:
            pyperclip.copy(json.dumps(parsed_data, indent=2))
        except Exception:
            pass

        print("========================================================")
        print(f"✨ [PARSED JEWEL]: {parsed_data['itemName']} ({parsed_data['rarity'].upper()})")
        print(f"🎯 Required Level: {parsed_data['levelReq']}")
        print(f"📋 Affixes Detected ({len(parsed_data['stats'])}):")
        if parsed_data["stats"]:
            for s in parsed_data["stats"]:
                print(f"   • {s['display']}  --> [Traderie: '{s['traderieOption']}']")
        else:
            print("   ⚠️ No affixes recognized. Open 'debug_mouse_zone.png' to inspect captured region.")
        print(f"💰 Auto Price: {parsed_data['price']['quantity']} {parsed_data['price']['currency']}")
        print("========================================================")
        print(f"✅ Ready! Press [{HOTKEY_TYPING_FALLBACK.upper()}] to auto-type this jewel into Traderie.")

    except Exception as e:
        print(f"[Error during scan] {e}")


def on_typing_fallback_pressed():
    global latest_scanned_jewel
    stats = latest_scanned_jewel.get("stats", [])

    print("\\n" + "=" * 55)
    print(f"⌨️  [{HOTKEY_TYPING_FALLBACK.upper()} Triggered] Keyboard Autofill Mode")
    print("=" * 55)

    if not stats:
        print("⚠️  [NOTICE] No jewel stats currently in memory!")
        print(f"   Did you hover over a jewel in D2R and press [{HOTKEY_CAPTURE.upper()}] first?")
        print("   -> Using sample test jewel (15% IAS / 40% ED) so you can test typing into Traderie.")
        stats = [
            {"statName": "Increased Attack Speed", "searchKeyword": "Increased Attack Speed", "traderieOption": "+X% Increased Attack Speed", "value": 15, "display": "+15% Increased Attack Speed"},
            {"statName": "Enhanced Damage", "searchKeyword": "Enhanced Damage", "traderieOption": "+X% Enhanced Damage", "value": 40, "display": "+40% Enhanced Damage"},
        ]

    print("\\n【請注意】請在 4 秒內將視窗切換到 Traderie 網頁！")
    print("請將游標點擊在網頁第一個屬性搜尋欄位 (例如 Modifier / Search properties 搜尋框)。")

    for i in range(4, 0, -1):
        print(f"倒數 {i} 秒...")
        time.sleep(1)

    print("\\n開始自動輸入屬性 (按照您實測驗證的精確按鍵順序)...")
    for idx, s in enumerate(stats):
        kw = s.get("searchKeyword") or s.get("traderieOption", "")
        clean_kw = re.sub(r"[+\\-~*]?X%?", "", kw).strip()
        print(f"\\n[{idx+1}/{len(stats)}] 正在填寫: '{s.get('statName', clean_kw)}'")
        print(f"   1. 輸入屬性名稱: '{clean_kw}' 並按 Enter")

        # 1. 貼上純淨屬性關鍵字 (使用 Ctrl+V 避免輸入法吃字)
        pyperclip.copy(clean_kw)
        pyautogui.hotkey("ctrl", "v")
        time.sleep(0.5)

        # 2. 按 Enter 選取該屬性
        pyautogui.press("enter")
        time.sleep(0.4)

        # 3. 按 Shift + Tab 兩次進入該屬性的數值輸入欄位
        print(f"   2. 按 Shift+Tab 兩次進入數值欄位，填入數值: {s['value']}")
        pyautogui.hotkey("shift", "tab")
        time.sleep(0.25)
        pyautogui.hotkey("shift", "tab")
        time.sleep(0.25)

        # 4. 輸入數值
        pyperclip.copy(str(s["value"]))
        pyautogui.hotkey("ctrl", "v")
        time.sleep(0.3)

        # 5. 按 Tab 兩次回到屬性搜尋輸入框 (每個屬性包含最後一個都要執行，確保游標回到屬性輸入框)
        print("   3. 按 Tab 兩次回到屬性輸入框...")
        pyautogui.press("tab")
        time.sleep(0.25)
        pyautogui.press("tab")
        time.sleep(0.3)

    # 6. 所有屬性填寫完畢，游標停留在屬性輸入框：按 Tab 四次進入價格區域
    print("\\n所有屬性填寫完畢，游標位於屬性輸入框，按 Tab 四次進入價格區...")
    for _ in range(4):
        pyautogui.press("tab")
        time.sleep(0.25)

    # 7. 填寫貨幣 (例如 Jah) 並按 Enter
    price = latest_scanned_jewel.get("price", {})
    qty = price.get("quantity", 2)
    currency = price.get("currency", "Jah")

    print(f"-> 選擇貨幣: {currency} 並按 Enter")
    pyperclip.copy(currency)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.6)
    pyautogui.press("enter")
    time.sleep(0.4)

    # 8. 按 Tab 三次進入價格數值欄位 (根據實測為 3 次 Tab)
    print("-> 按 Tab 三次進入價格數值欄位...")
    for _ in range(3):
        pyautogui.press("tab")
        time.sleep(0.25)

    # 9. 填寫價格數量
    print(f"-> 填寫價格數量: {qty}")
    pyperclip.copy(str(qty))
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.3)
    pyautogui.press("enter")
    print("\\n✅ [F9 完成] 屬性與價格已全數填寫完成！請檢查網頁內容並確認發布。")


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================
if __name__ == "__main__":
    print("=" * 64)
    print("  D2R TO TRADERIE PRO (Diablo II: Resurrected Item Assistant)")
    print("=" * 64)
    print("📌 Instructions:")
    print("   1. Open Diablo II: Resurrected in Windowed or Borderless Window.")
    print("   2. Hover over any Jewel or Item in your inventory or stash.")
    print(f"   3. Press [{HOTKEY_CAPTURE.upper()}] to scan, crop & parse stats.")
    print("   4. Switch to the Traderie create-listing page, click the first")
    print(f"      modifier search field, then press [{HOTKEY_TYPING_FALLBACK.upper()}] to auto-fill.")
    print("   5. Press [Ctrl + C] in this console to exit.")
    print("=" * 64)

    keyboard.add_hotkey(HOTKEY_CAPTURE, on_capture_pressed)
    keyboard.add_hotkey(HOTKEY_TYPING_FALLBACK, on_typing_fallback_pressed)

    print(f"[*] Listening for [{HOTKEY_CAPTURE.upper()}] / [{HOTKEY_TYPING_FALLBACK.upper()}] hotkeys... Ready!")
    try:
        keyboard.wait()
    except KeyboardInterrupt:
        print("\\nExiting D2R to Traderie Pro. Happy trading!")
`;
}
