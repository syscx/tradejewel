import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Built-in rule-based fallback parser for D2R jewel OCR text
function ruleBasedJewelParser(rawText: string) {
  let clean = rawText
    .toUpperCase()
    // 1. Accents
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÁÀÂ]/g, 'A')
    .replace(/[ÍÌÎ]/g, 'I')
    .replace(/[ÓÒÔ]/g, 'O')
    .replace(/[ÚÙÛ]/g, 'U')
    // 2. Brackets before digits
    .replace(/\[(\d+)/g, '1$1')
    .replace(/\*\[/g, '*1')
    .replace(/#\[/g, '#1')
    // 3. Exocet symbols
    .replace(/[@®]/g, 'O')
    .replace(/P[O0]+IS[O0]+N/g, 'POISON')
    .replace(/PEISON|PISON|POISOON/g, 'POISON')
    .replace(/\bC[O0E]L[PD]\b/g, 'COLD')
    .replace(/CELP|COLP|CELD|COL0/g, 'COLD')
    .replace(/T0\s*LIFE/g, 'TO LIFE')
    .replace(/BEASST/g, 'BEAST')
    .replace(/[*#](\d+)/g, '+$1')
    .replace(/[~-]I5\b/g, '-15')
    .replace(/[~-]I(\d+)/g, '-$1')
    .replace(/[~](\d+)/g, '-$1')
    .replace(/(\d+)[OQ@]+/g, '$10')
    .replace(/MA+XIMUM/g, 'MAXIMUM')
    .replace(/\+?2[O0]\b/g, '20')
    .replace(/(\b\+?\d{2})4\b(?=\s*$|\s+[A-Z=])/g, '$1%')
    .replace(/RESISST|RESIIST|RESISTT/g, 'RESIST')
    .replace(/ALLRESISTANCES/g, 'ALL RESISTANCES');

  const rawLines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const detectedAffixes: Array<{
    statName: string;
    searchKeyword?: string;
    traderieOption: string;
    value: number;
    display: string;
  }> = [];

  // Helper to extract first integer sequence from regex match
  const extractNum = (pattern: RegExp): number | null => {
    const m = clean.match(pattern);
    if (m) {
      for (let i = 1; i < m.length; i++) {
        if (m[i]) {
          const digits = m[i].replace(/\D/g, '');
          if (digits) return parseInt(digits, 10);
        }
      }
    }
    return null;
  };

  // Determine Item Name
  let itemName = 'Rare Jewel';
  for (let idx = 0; idx < rawLines.length; idx++) {
    const l = rawLines[idx];
    if (l.includes('CAN BE INSERTED') && idx > 0) {
      let prev = rawLines[idx - 1];
      if (prev.includes('JEWEL') && idx > 1) {
        prev = rawLines[idx - 2];
      }
      const cleaned = prev.replace(/^[^A-Z]+|[^A-Z]+$/g, '').trim();
      if (cleaned.length >= 3) {
        itemName = cleaned;
        break;
      }
    } else if (/GYRE|HEART|TALISMAN|MARK|SCARAB|DOOM|EYE|BEAST|FERVOR|TRUTH/i.test(l)) {
      const cleanedTitle = l.replace(/^[^A-Z]+|[^A-Z]+$/g, '').trim();
      if (cleanedTitle.length >= 3) {
        itemName = cleanedTitle;
        break;
      }
    }
  }

  // Determine Rarity
  let rarity: 'Magic' | 'Rare' | 'Unique' = 'Magic';
  if (/FACET|RAINBOW/i.test(clean)) {
    rarity = 'Unique';
  } else if (rawLines.length > 4 || /RARE|GYRE|HEART|TALISMAN|SCARAB|BLOOD|GHOUL|DOOM|CHAOS|BONE|SKULL|BEAST/i.test(clean)) {
    rarity = 'Rare';
  }

  // Level Requirement
  const levelReq = extractNum(/(?:REQUIRED LEVEL|LEVEL)[^\d\n]*(\d+)/i) || 30;

  // Requirements % (Gatekeeper)
  const reqVal = extractNum(/REQUIREMENTS?[^\d\n]*[~-]?\s*(\d+)/i) || (/(?:REQUIREMENT|REQ)/i.test(clean) && (clean.includes('15') || clean.includes('I5')) ? 15 : null);
  if (reqVal !== null) {
    detectedAffixes.push({
      statName: 'Requirements',
      searchKeyword: 'Requirements',
      traderieOption: 'Requirements -X%',
      value: reqVal,
      display: `Requirements -${reqVal}%`,
    });
  }

  // Resistances (tolerant of '*', '+', colons, separators)
  let allResVal = extractNum(/(?:ALL\s*RESIST\w*)[^\d\n]*(\d+)%?|(\d+)%?[^\d\n]*(?:ALL\s*RESIST\w*)/i);
  if (allResVal !== null) {
    if (allResVal > 20 && String(allResVal).endsWith('4')) {
      allResVal = parseInt(String(allResVal).slice(0, -1), 10);
    }
    detectedAffixes.push({
      statName: 'All Resistances',
      searchKeyword: 'All Resistances',
      traderieOption: 'All Resistances +X%',
      value: allResVal,
      display: `All Resistances +${allResVal}%`,
    });
  } else {
    const singleResists: Array<{ name: string; pattern: RegExp; trad: string; searchKw: string }> = [
      { name: 'Lightning Resist', pattern: /(?:LIGHTNING\s*RESIST\w*)[^\d\n]*(\d+)%?|(\d+)%?[^\d\n]*(?:LIGHTNING\s*RESIST\w*)/i, trad: 'Lightning Resist +X%', searchKw: 'Lightning Resist' },
      { name: 'Fire Resist', pattern: /(?:FIRE\s*RESIST\w*)[^\d\n]*(\d+)%?|(\d+)%?[^\d\n]*(?:FIRE\s*RESIST\w*)/i, trad: 'Fire Resist +X%', searchKw: 'Fire Resist' },
      { name: 'Cold Resist', pattern: /(?:COLD\s*RESIST\w*)[^\d\n]*(\d+)%?|(\d+)%?[^\d\n]*(?:COLD\s*RESIST\w*)/i, trad: 'Cold Resist +X%', searchKw: 'Cold Resist' },
      { name: 'Poison Resist', pattern: /(?:POISON\s*RESIST\w*)[^\d\n]*(\d+)%?|(\d+)%?[^\d\n]*(?:POISON\s*RESIST\w*)/i, trad: 'Poison Resist +X%', searchKw: 'Poison Resist' },
    ];

    for (const r of singleResists) {
      let val = extractNum(r.pattern);
      if (val !== null) {
        if (val > 40 && String(val).endsWith('4')) {
          val = parseInt(String(val).slice(0, -1), 10);
        }
        detectedAffixes.push({
          statName: r.name,
          searchKeyword: r.searchKw,
          traderieOption: r.trad,
          value: val,
          display: `${r.name} +${val}%`,
        });
      }
    }
  }

  // Poison Damage (Strictly number before "POISON DAMAGE", never duration "OVER X SECONDS")
  const psnMatch = clean.match(/(\d+)[^\d\n]*POISON\s*DAMAGE/i);
  let psnDmg: number | null = null;
  if (psnMatch) {
    const digits = psnMatch[1].replace(/\D/g, '');
    if (digits) psnDmg = parseInt(digits, 10);
  } else if (/POISON\s*DAMAGE/i.test(clean) || (/POIS/i.test(clean) && /DAMAGE/i.test(clean))) {
    psnDmg = 20;
  }

  if (psnDmg !== null) {
    detectedAffixes.push({
      statName: 'Poison Damage',
      searchKeyword: 'Poison Damage',
      traderieOption: '+X Poison Damage',
      value: psnDmg,
      display: `+${psnDmg} Poison Damage over 2 Seconds`,
    });
  }

  // Maximum Stamina (tolerant of STAR, STA, STAMINA)
  const stamVal = extractNum(/(\d+)[^\d\n]*MAX\w*\s*(?:STAMINA|STA\w*|STAR)|MAX\w*\s*(?:STAMINA|STA\w*|STAR)[^\d\n]*(\d+)/i);
  if (stamVal !== null) {
    detectedAffixes.push({
      statName: 'Maximum Stamina',
      searchKeyword: 'Maximum Stamina',
      traderieOption: '+X to Maximum Stamina',
      value: stamVal,
      display: `+${stamVal} Maximum Stamina`,
    });
  }

  // Defense
  const defenseVal = extractNum(/(\d+)\s*DEFENSE|DEFENSE[^\d\n]*(\d+)/i);
  if (defenseVal !== null) {
    detectedAffixes.push({
      statName: 'Defense',
      searchKeyword: 'Defense',
      traderieOption: '+X Defense',
      value: defenseVal,
      display: `+${defenseVal} Defense`,
    });
  }


  // Increased Attack Speed
  const iasVal = extractNum(/(\d+)%?[^\d\n]*(?:INCREASED ATTACK SPEED|IAS)|(?:INCREASED ATTACK SPEED|IAS)[^\d\n]*(\d+)/i);
  if (iasVal !== null) {
    detectedAffixes.push({
      statName: 'Increased Attack Speed',
      traderieOption: '+X% Increased Attack Speed',
      value: iasVal,
      display: `+${iasVal}% Increased Attack Speed`,
    });
  }

  // Enhanced Damage
  const edVal = extractNum(/(\d+)%?[^\d\n]*ENHANCED DAMAGE|ENHANCED DAMAGE[^\d\n]*(\d+)/i);
  if (edVal !== null) {
    detectedAffixes.push({
      statName: 'Enhanced Damage',
      traderieOption: '+X% Enhanced Damage',
      value: edVal,
      display: `+${edVal}% Enhanced Damage`,
    });
  }

  // Life
  const lifeVal = extractNum(/(\d+)[^\d\n]*(?:TO\s+)?LIFE|\bLIFE[^\d\n]*(\d+)/i);
  if (lifeVal !== null) {
    detectedAffixes.push({
      statName: 'Life',
      traderieOption: '+X to Life',
      value: lifeVal,
      display: `+${lifeVal} to Life`,
    });
  }

  // Strength
  const strVal = extractNum(/(\d+)[^\d\n]*(?:TO\s+)?STRENGTH|\bSTRENGTH[^\d\n]*(\d+)/i);
  if (strVal !== null) {
    detectedAffixes.push({
      statName: 'Strength',
      traderieOption: '+X to Strength',
      value: strVal,
      display: `+${strVal} to Strength`,
    });
  }

  // Dexterity
  const dexVal = extractNum(/(\d+)[^\d\n]*(?:TO\s+)?DEXTERITY|\bDEXTERITY[^\d\n]*(\d+)/i);
  if (dexVal !== null) {
    detectedAffixes.push({
      statName: 'Dexterity',
      traderieOption: '+X to Dexterity',
      value: dexVal,
      display: `+${dexVal} to Dexterity`,
    });
  }

  // Maximum Damage
  const maxDmgMatch = clean.match(/\+?(\d+)\s*TO\s*MAXIMUM\s*DAMAGE|\bTO\s*MAXIMUM\s*DAMAGE\s*\+?(\d+)/i);
  if (maxDmgMatch) {
    const val = parseInt(maxDmgMatch[1] || maxDmgMatch[2], 10);
    detectedAffixes.push({
      statName: 'Maximum Damage',
      traderieOption: '+X to Maximum Damage',
      value: val,
      display: `+${val} to Maximum Damage`,
    });
  }

  // Price heuristic in Jah
  let priceJah = 1;
  const isGodTier = detectedAffixes.some(a => a.statName === 'Increased Attack Speed') &&
                    detectedAffixes.some(a => a.statName === 'Enhanced Damage');
  const hasMultipleHighMods = detectedAffixes.length >= 3;

  if (isGodTier) {
    priceJah = 15;
  } else if (hasMultipleHighMods) {
    priceJah = 5;
  } else if (detectedAffixes.length >= 2) {
    priceJah = 3;
  }

  return {
    itemName,
    rarity,
    levelReq: levelReq || 30,
    itemType: 'Jewel',
    affixes: detectedAffixes,
    priceEstimate: {
      minJah: Math.max(1, priceJah - 1),
      maxJah: priceJah + 2,
      reasoning: isGodTier
        ? 'High value 15 IAS / ED combination jewel'
        : `${detectedAffixes.length} valuable combat/survival modifiers`,
    },
    traderieListingData: {
      category: 'Jewel',
      rarity: rarity.toLowerCase(),
      levelReq: levelReq || 30,
      ladder: 'Non-Ladder',
      mode: 'Softcore',
      platform: 'PC',
      stats: detectedAffixes,
      price: {
        currency: 'Jah',
        quantity: priceJah,
      },
    },
    source: 'rule-engine',
  };
}

// API endpoint to parse D2R Jewel screenshot or text
app.post('/api/parse-jewel', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', rawText } = req.body;

    // If Gemini is available and image is sent, run Vision Model
    if (ai && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const prompt = `You are an expert Diablo II: Resurrected item appraiser and Traderie listing assistant.
Analyze this D2R item tooltip screenshot (specifically a Jewel, Charm, or item).
Identify with 100% precision:
1. Item Title / Name (e.g., "Ruby Jewel of Fervor", "Beast Heart Jewel", "Rainbow Facet")
2. Rarity: exactly one of "Magic", "Rare", "Unique"
3. Required Level (integer, or null if none)
4. Item type (e.g., "Jewel")
5. Every single affix/modifier clearly listed on the item (e.g., Increased Attack Speed, Enhanced Damage, Life, Strength, Dexterity, Faster Hit Recovery, All Resistances, Fire/Cold/Lightning/Poison Resist, Maximum Damage, Minimum Damage, Requirements -X%).
6. Map each affix to the standard Traderie listing option name (such as "+X% Increased Attack Speed", "+X% Enhanced Damage", "+X to Life", "All Resistances +X%", "Requirements -X%", etc.) and its exact numeric value.
7. Realistic market price estimation in Jah runes (minJah and maxJah) based on current D2R endgame trading meta.

Return pure JSON matching this exact structure:
{
  "itemName": string,
  "rarity": "Magic" | "Rare" | "Unique",
  "levelReq": number | null,
  "itemType": "Jewel",
  "affixes": [
    {
      "statName": string,
      "traderieOption": string,
      "value": number,
      "display": string
    }
  ],
  "priceEstimate": {
    "minJah": number,
    "maxJah": number,
    "reasoning": string
  },
  "traderieListingData": {
    "category": "Jewel",
    "rarity": "magic" | "rare" | "unique",
    "levelReq": number | null,
    "ladder": "Non-Ladder",
    "mode": "Softcore",
    "platform": "PC",
    "stats": [
      {
        "statName": string,
        "traderieOption": string,
        "value": number,
        "display": string
      }
    ],
    "price": {
      "currency": "Jah",
      "quantity": number
    }
  }
}`;

        const imagePart = {
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: cleanBase64,
          },
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [imagePart, { text: prompt }],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const outputText = response.text || '';
        const parsed = JSON.parse(outputText);
        return res.json({ success: true, ...parsed, source: 'gemini-vision' });
      } catch (geminiError: any) {
        console.warn('Gemini vision analysis failed or returned non-JSON, falling back to rule engine:', geminiError?.message);
      }
    }

    // Fallback: If rawText is provided or Gemini failed
    if (rawText) {
      const parsed = ruleBasedJewelParser(rawText);
      return res.json({ success: true, ...parsed });
    }

    // If neither or empty
    return res.status(400).json({
      error: 'Please provide either a screenshot image (imageBase64) or OCR text (rawText).',
    });
  } catch (err: any) {
    console.error('Error in /api/parse-jewel:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// Provide the improved Python script for direct download / raw copy
app.get('/api/download/python-script', (req, res) => {
  res.setHeader('Content-Type', 'text/x-python');
  res.setHeader('Content-Disposition', 'attachment; filename="d2r_traderie_pro.py"');
  // We can pipe or send the text
  res.send('# See in-app code exporter for full script');
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`D2R to Traderie Pro server listening on port ${PORT}`);
  });
}

startServer();
