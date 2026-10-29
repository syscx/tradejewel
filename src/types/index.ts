export interface JewelAffix {
  statName: string;
  traderieOption: string;
  value: number;
  display: string;
  unit?: string;
}

export interface TraderieListingData {
  category: string;
  rarity: 'magic' | 'rare' | 'unique';
  levelReq: number | null;
  ladder: 'Ladder' | 'Non-Ladder';
  mode: 'Softcore' | 'Hardcore';
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Switch';
  stats: JewelAffix[];
  price: {
    currency: string;
    quantity: number;
  };
}

export interface ParsedJewel {
  itemName: string;
  rarity: 'Magic' | 'Rare' | 'Unique';
  levelReq: number | null;
  itemType: string;
  affixes: JewelAffix[];
  priceEstimate: {
    minJah: number;
    maxJah: number;
    reasoning: string;
  };
  traderieListingData: TraderieListingData;
  source?: 'gemini-vision' | 'rule-engine' | 'sample';
}

export interface ScriptConfig {
  hotkeyCapture: string;
  hotkeyFill: string;
  tesseractPath: string;
  autoPriceEnabled: boolean;
  basePriceJah: number;
  targetLeague: 'Non-Ladder' | 'Ladder';
  targetMode: 'Softcore' | 'Hardcore';
  targetPlatform: 'PC' | 'PlayStation' | 'Xbox' | 'Switch';
}
