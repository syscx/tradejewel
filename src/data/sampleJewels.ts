import { ParsedJewel } from '../types';

export const SAMPLE_JEWELS: Array<{
  id: string;
  name: string;
  type: string;
  rarity: 'Magic' | 'Rare' | 'Unique';
  description: string;
  rawOcrText: string;
  parsed: ParsedJewel;
}> = [
  {
    id: 'ruby-fervor',
    name: 'Ruby Jewel of Fervor',
    type: 'Magic Jewel (Godly)',
    rarity: 'Magic',
    description: 'Iconic 15 IAS / 40 ED combat jewel for physical bowazons and melee zealots.',
    rawOcrText: `RUBY JEWEL OF FERVOR
REQUIRED LEVEL: 58
+15% INCREASED ATTACK SPEED
+40% ENHANCED DAMAGE`,
    parsed: {
      itemName: 'Ruby Jewel of Fervor',
      rarity: 'Magic',
      levelReq: 58,
      itemType: 'Jewel',
      affixes: [
        {
          statName: 'Increased Attack Speed',
          traderieOption: '+X% Increased Attack Speed',
          value: 15,
          display: '+15% Increased Attack Speed',
        },
        {
          statName: 'Enhanced Damage',
          traderieOption: '+X% Enhanced Damage',
          value: 40,
          display: '+40% Enhanced Damage',
        },
      ],
      priceEstimate: {
        minJah: 20,
        maxJah: 30,
        reasoning: 'Perfect roll 15% IAS / 40% ED is one of the highest-demand endgame jewels.',
      },
      traderieListingData: {
        category: 'Jewel',
        rarity: 'magic',
        levelReq: 58,
        ladder: 'Non-Ladder',
        mode: 'Softcore',
        platform: 'PC',
        stats: [
          {
            statName: 'Increased Attack Speed',
            traderieOption: '+X% Increased Attack Speed',
            value: 15,
            display: '+15% Increased Attack Speed',
          },
          {
            statName: 'Enhanced Damage',
            traderieOption: '+X% Enhanced Damage',
            value: 40,
            display: '+40% Enhanced Damage',
          },
        ],
        price: { currency: 'Jah', quantity: 25 },
      },
      source: 'sample',
    },
  },
  {
    id: 'beast-gyre',
    name: 'Beast Gyre',
    type: 'Rare 4-Affix Jewel (GG Caster/Melee)',
    rarity: 'Rare',
    description: 'High stat rare jewel featuring +9 Str, +9 Dex, 30 Fire Res, and -15% Requirements.',
    rawOcrText: `BEAST GYRE
JEWEL
REQUIRED LEVEL: 42
+9 TO STRENGTH
+9 TO DEXTERITY
FIRE RESIST +30%
REQUIREMENTS -15%`,
    parsed: {
      itemName: 'Beast Gyre',
      rarity: 'Rare',
      levelReq: 42,
      itemType: 'Jewel',
      affixes: [
        {
          statName: 'Strength',
          traderieOption: '+X to Strength',
          value: 9,
          display: '+9 to Strength',
        },
        {
          statName: 'Dexterity',
          traderieOption: '+X to Dexterity',
          value: 9,
          display: '+9 to Dexterity',
        },
        {
          statName: 'Fire Resist',
          traderieOption: 'Fire Resist +X%',
          value: 30,
          display: 'Fire Resist +30%',
        },
        {
          statName: 'Requirements',
          traderieOption: 'Requirements -X%',
          value: 15,
          display: 'Requirements -15%',
        },
      ],
      priceEstimate: {
        minJah: 8,
        maxJah: 14,
        reasoning: 'Quad useful stat roll with max fire resistance (30%) and -15% requirements.',
      },
      traderieListingData: {
        category: 'Jewel',
        rarity: 'rare',
        levelReq: 42,
        ladder: 'Non-Ladder',
        mode: 'Softcore',
        platform: 'PC',
        stats: [
          {
            statName: 'Strength',
            traderieOption: '+X to Strength',
            value: 9,
            display: '+9 to Strength',
          },
          {
            statName: 'Dexterity',
            traderieOption: '+X to Dexterity',
            value: 9,
            display: '+9 to Dexterity',
          },
          {
            statName: 'Fire Resist',
            traderieOption: 'Fire Resist +X%',
            value: 30,
            display: 'Fire Resist +30%',
          },
          {
            statName: 'Requirements',
            traderieOption: 'Requirements -X%',
            value: 15,
            display: 'Requirements -15%',
          },
        ],
        price: { currency: 'Jah', quantity: 10 },
      },
      source: 'sample',
    },
  },
  {
    id: 'scintillating-truth',
    name: 'Scintillating Jewel of Truth',
    type: 'Magic All-Res Jewel',
    rarity: 'Magic',
    description: '15 All Resistances paired with 7% Faster Hit Recovery (FHR break point staple).',
    rawOcrText: `SCINTILLATING JEWEL OF TRUTH
REQUIRED LEVEL: 36
+7% FASTER HIT RECOVERY
ALL RESISTANCES +15%`,
    parsed: {
      itemName: 'Scintillating Jewel of Truth',
      rarity: 'Magic',
      levelReq: 36,
      itemType: 'Jewel',
      affixes: [
        {
          statName: 'Faster Hit Recovery',
          traderieOption: '+X% Faster Hit Recovery',
          value: 7,
          display: '+7% Faster Hit Recovery',
        },
        {
          statName: 'All Resistances',
          traderieOption: 'All Resistances +X%',
          value: 15,
          display: 'All Resistances +15%',
        },
      ],
      priceEstimate: {
        minJah: 4,
        maxJah: 7,
        reasoning: 'Max rolled 15 All Res with desirable 7% FHR suffix for PvP and Sorceress gear.',
      },
      traderieListingData: {
        category: 'Jewel',
        rarity: 'magic',
        levelReq: 36,
        ladder: 'Non-Ladder',
        mode: 'Softcore',
        platform: 'PC',
        stats: [
          {
            statName: 'Faster Hit Recovery',
            traderieOption: '+X% Faster Hit Recovery',
            value: 7,
            display: '+7% Faster Hit Recovery',
          },
          {
            statName: 'All Resistances',
            traderieOption: 'All Resistances +X%',
            value: 15,
            display: 'All Resistances +15%',
          },
        ],
        price: { currency: 'Jah', quantity: 5 },
      },
      source: 'sample',
    },
  },
  {
    id: 'doom-mark',
    name: 'Doom Mark',
    type: 'Rare Life & Resist Jewel',
    rarity: 'Rare',
    description: 'Life, Cold Resist, Lightning Resist, and Maximum Damage.',
    rawOcrText: `DOOM MARK
JEWEL
REQUIRED LEVEL: 37
+20 TO LIFE
COLD RESIST +26%
LIGHTNING RESIST +24%
+9 TO MAXIMUM DAMAGE`,
    parsed: {
      itemName: 'Doom Mark',
      rarity: 'Rare',
      levelReq: 37,
      itemType: 'Jewel',
      affixes: [
        {
          statName: 'Life',
          traderieOption: '+X to Life',
          value: 20,
          display: '+20 to Life',
        },
        {
          statName: 'Cold Resist',
          traderieOption: 'Cold Resist +X%',
          value: 26,
          display: 'Cold Resist +26%',
        },
        {
          statName: 'Lightning Resist',
          traderieOption: 'Lightning Resist +X%',
          value: 24,
          display: 'Lightning Resist +24%',
        },
        {
          statName: 'Maximum Damage',
          traderieOption: '+X to Maximum Damage',
          value: 9,
          display: '+9 to Maximum Damage',
        },
      ],
      priceEstimate: {
        minJah: 3,
        maxJah: 6,
        reasoning: 'Dual high resistance roll with max 20 Life and bonus max damage.',
      },
      traderieListingData: {
        category: 'Jewel',
        rarity: 'rare',
        levelReq: 37,
        ladder: 'Non-Ladder',
        mode: 'Softcore',
        platform: 'PC',
        stats: [
          {
            statName: 'Life',
            traderieOption: '+X to Life',
            value: 20,
            display: '+20 to Life',
          },
          {
            statName: 'Cold Resist',
            traderieOption: 'Cold Resist +X%',
            value: 26,
            display: 'Cold Resist +26%',
          },
          {
            statName: 'Lightning Resist',
            traderieOption: 'Lightning Resist +X%',
            value: 24,
            display: 'Lightning Resist +24%',
          },
          {
            statName: 'Maximum Damage',
            traderieOption: '+X to Maximum Damage',
            value: 9,
            display: '+9 to Maximum Damage',
          },
        ],
        price: { currency: 'Jah', quantity: 4 },
      },
      source: 'sample',
    },
  },
];
