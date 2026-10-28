// ==UserScript==
// @name         Traderie D2R Jewel 1-Click Auto-Filler
// @namespace    https://traderie.com/
// @version      2.0.0
// @description  Instantly fills Diablo II: Resurrected jewels and charms into Traderie from D2R OCR Bridge
// @author       D2R to Traderie Pro
// @match        https://traderie.com/diablo_2_resurrected/*
// @match        https://*.traderie.com/diablo_2_resurrected/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    const BRIDGE_URL = "http://127.0.0.1:8765";
    let lastProcessedTimestamp = 0;

    console.log("[D2R Traderie Pro] Userscript initialized. Monitoring bridge at " + BRIDGE_URL);

    // Create floating status & action panel
    const panel = document.createElement("div");
    panel.id = "d2r-traderie-bridge-panel";
    panel.style.position = "fixed";
    panel.style.bottom = "24px";
    panel.style.right = "24px";
    panel.style.zIndex = "999999";
    panel.style.background = "#121317";
    panel.style.border = "1px solid #d97706";
    panel.style.borderRadius = "12px";
    panel.style.padding = "14px 18px";
    panel.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(217, 119, 6, 0.3)";
    panel.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
    panel.style.color = "#f4f4f5";
    panel.style.fontSize = "13px";
    panel.style.minWidth = "260px";

    panel.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981;" id="d2r-status-indicator"></span>
          <strong style="color:#fbbf24; font-size:14px; letter-spacing:0.5px;">D2R Auto-Lister</strong>
        </div>
        <span style="font-size:11px; color:#a1a1aa; background:#27272a; padding:2px 6px; border-radius:4px;">Port 8765</span>
      </div>
      <div id="d2r-item-summary" style="margin-bottom:12px; color:#d4d4d8; font-size:12px; line-height:1.4;">
        Press <b>F10</b> in D2R to scan jewel.
      </div>
      <div style="display:flex; gap:8px;">
        <button id="d2r-btn-autofill" style="flex:1; background:#d97706; color:#fff; border:none; border-radius:6px; padding:7px 12px; font-weight:600; cursor:pointer; font-size:12px;">
          ⚡ Auto-Fill Form
        </button>
        <button id="d2r-btn-paste" style="background:#27272a; color:#e4e4e7; border:1px solid #3f3f46; border-radius:6px; padding:7px 10px; cursor:pointer; font-size:12px;" title="Paste JSON from Clipboard">
          📋 Paste
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    function updateSummary(item) {
      const summaryEl = document.getElementById("d2r-item-summary");
      if (!summaryEl) return;
      if (!item || !item.itemName) {
        summaryEl.innerHTML = "No item loaded yet. Press <b>F10</b> in D2R.";
        return;
      }
      const statCount = item.stats ? item.stats.length : 0;
      summaryEl.innerHTML = `
        <div style="color:#fbbf24; font-weight:600;">${item.itemName} (${item.rarity.toUpperCase()})</div>
        <div style="color:#9ca3af; font-size:11px;">${statCount} affixes | Price: ${item.price?.quantity || 2} ${item.price?.currency || 'Jah'}</div>
      `;
    }

    function setNativeValue(element, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        element.value = value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function executeFill(item) {
      if (!item) {
        alert("No item data detected! Press F10 in D2R first.");
        return;
      }

      console.log("[D2R Traderie Pro] Filling item:", item);
      const btn = document.getElementById("d2r-btn-autofill");
      if (btn) btn.innerText = "⏳ Filling...";

      try {
        if (item.levelReq) {
          const reqInputs = Array.from(document.querySelectorAll('input[type="number"], input[placeholder*="level" i], input[placeholder*="lvl" i]'));
          if (reqInputs.length > 0) {
            setNativeValue(reqInputs[0], item.levelReq);
          }
        }

        if (item.stats && item.stats.length > 0) {
          for (const stat of item.stats) {
            const statInputs = Array.from(document.querySelectorAll('input[placeholder*="Search stat" i], input[placeholder*="Modifier" i], input[placeholder*="Add property" i], input[aria-autocomplete="list"]'));
            if (statInputs.length > 0) {
              const targetInput = statInputs[statInputs.length - 1];
              targetInput.focus();
              const term = stat.searchKeyword || (stat.traderieOption ? stat.traderieOption.replace(/[+\-~*]?X%?/g, '').trim() : stat.statName);
              setNativeValue(targetInput, term);
              targetInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
            }
          }
        }

        const priceInputs = Array.from(document.querySelectorAll('input[placeholder*="Price" i], input[placeholder*="Quantity" i], input[placeholder*="Amount" i]'));
        if (priceInputs.length > 0 && item.price?.quantity) {
          setNativeValue(priceInputs[priceInputs.length - 1], item.price.quantity);
        }

        if (btn) {
          btn.innerText = "✅ Filled!";
          setTimeout(() => { btn.innerText = "⚡ Auto-Fill Form"; }, 2500);
        }
      } catch (err) {
        console.error("Autofill error:", err);
        if (btn) btn.innerText = "⚡ Auto-Fill Form";
      }
    }

    function checkBridge() {
      if (typeof GM_xmlhttpRequest === "undefined") return;

      GM_xmlhttpRequest({
        method: "GET",
        url: BRIDGE_URL,
        timeout: 2000,
        onload: function(response) {
          const indicator = document.getElementById("d2r-status-indicator");
          if (indicator) indicator.style.background = "#10b981";

          try {
            const data = JSON.parse(response.responseText);
            if (data && data.timestamp && data.timestamp > lastProcessedTimestamp) {
              lastProcessedTimestamp = data.timestamp;
              updateSummary(data);
              executeFill(data);
            }
          } catch (e) {}
        },
        onerror: function() {
          const indicator = document.getElementById("d2r-status-indicator");
          if (indicator) indicator.style.background = "#ef4444";
        }
      });
    }

    setInterval(checkBridge, 1500);

    document.getElementById("d2r-btn-autofill")?.addEventListener("click", () => {
      checkBridge();
    });

    document.getElementById("d2r-btn-paste")?.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        const parsed = JSON.parse(text);
        updateSummary(parsed);
        executeFill(parsed);
      } catch (e) {
        alert("Clipboard does not contain valid D2R jewel JSON. Press F10 in game first!");
      }
    });

})();
