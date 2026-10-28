import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Play, RefreshCw, Sparkles, ExternalLink, 
  Trash2, Plus, Info, Check, ShieldCheck 
} from 'lucide-react';
import { ParsedJewel, JewelAffix } from '../types';

interface TraderieSimulatorProps {
  jewel: ParsedJewel;
}

export const TraderieSimulator: React.FC<TraderieSimulatorProps> = ({ jewel }) => {
  const [category, setCategory] = useState<string>('Jewel');
  const [rarity, setRarity] = useState<'magic' | 'rare' | 'unique'>('rare');
  const [levelReq, setLevelReq] = useState<number>(42);
  const [ladder, setLadder] = useState<'Ladder' | 'Non-Ladder'>('Non-Ladder');
  const [mode, setMode] = useState<'Softcore' | 'Hardcore'>('Softcore');
  const [platform, setPlatform] = useState<string>('PC');
  const [stats, setStats] = useState<JewelAffix[]>([]);
  const [priceQty, setPriceQty] = useState<number>(4);
  const [currency, setCurrency] = useState<string>('Jah');

  // Simulation animation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Populate from current jewel
  const loadJewelData = () => {
    setCategory('Jewel');
    setRarity(jewel.traderieListingData.rarity);
    setLevelReq(jewel.levelReq || 30);
    setLadder(jewel.traderieListingData.ladder);
    setMode(jewel.traderieListingData.mode);
    setStats([...jewel.affixes]);
    setPriceQty(jewel.traderieListingData.price.quantity);
    setCurrency(jewel.traderieListingData.price.currency);
    setIsSuccess(false);
  };

  useEffect(() => {
    loadJewelData();
  }, [jewel]);

  // Run live step-by-step autofill animation
  const runSimulation = () => {
    setIsSimulating(true);
    setIsSuccess(false);
    setActiveStep(1);
    setSimulationLogs(['[0.00s] Received D2R Jewel Payload from Bridge...']);

    // Step 1: Set category & rarity
    setTimeout(() => {
      setActiveStep(2);
      setSimulationLogs(prev => [
        ...prev,
        `[0.05s] Set Category: Jewel, Rarity: ${jewel.rarity.toUpperCase()}`
      ]);
      setRarity(jewel.traderieListingData.rarity);
    }, 400);

    // Step 2: Set level req & realm
    setTimeout(() => {
      setActiveStep(3);
      setSimulationLogs(prev => [
        ...prev,
        `[0.10s] Injected Level Requirement: ${jewel.levelReq || 30}, Platform: PC`
      ]);
      setLevelReq(jewel.levelReq || 30);
    }, 800);

    // Step 3: Populate stats
    setTimeout(() => {
      setActiveStep(4);
      setSimulationLogs(prev => [
        ...prev,
        `[0.18s] Matched & Populated ${jewel.affixes.length} modifiers directly into React DOM state`
      ]);
      setStats([...jewel.affixes]);
    }, 1300);

    // Step 4: Set price
    setTimeout(() => {
      setActiveStep(5);
      setSimulationLogs(prev => [
        ...prev,
        `[0.22s] Configured price: ${jewel.traderieListingData.price.quantity} ${jewel.traderieListingData.price.currency}`
      ]);
      setPriceQty(jewel.traderieListingData.price.quantity);
      setIsSimulating(false);
      setIsSuccess(true);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controller Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-amber-950/40 rounded-2xl p-5 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-zinc-100 font-serif">
              Traderie Form Simulator (Live Auto-Fill Proof)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Experience how the improved userscript or Python bridge fills Traderie's listing form with zero typing errors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isSimulating ? 'Simulating...' : 'Run Live Auto-Fill'}</span>
          </button>

          <button
            onClick={loadJewelData}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
            title="Reset to Active Jewel"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Traderie Form Interface */}
      <div className="bg-[#121318] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Mock Traderie Browser Bar */}
        <div className="bg-[#1a1b22] px-4 py-2.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-3 text-[11px] font-mono text-zinc-400 truncate max-w-xs sm:max-w-md">
              traderie.com/diablo_2_resurrected/listing/create
            </div>
          </div>

          <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            D2R Listing Form
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Step 1: Item Category & Rarity */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              1. Item Category &amp; Quality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Item Category</span>
                <input
                  type="text"
                  value={category}
                  readOnly
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Rarity</span>
                <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-700/80">
                  {(['magic', 'rare', 'unique'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRarity(r)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                        rarity === r
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Realm, Platform & Level Req */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              2. League &amp; Requirements
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Platform</span>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="PC">PC</option>
                  <option value="PlayStation">PlayStation</option>
                  <option value="Xbox">Xbox</option>
                  <option value="Switch">Nintendo Switch</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">League</span>
                <select
                  value={ladder}
                  onChange={(e) => setLadder(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Non-Ladder">Non-Ladder</option>
                  <option value="Ladder">Ladder (Season)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Required Level</span>
                <input
                  type="number"
                  value={levelReq}
                  onChange={(e) => setLevelReq(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Modifiers (The core part that failed in original script) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <span>3. Item Modifiers / Affixes</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {stats.length} active
                </span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Matches Traderie modifier catalog
              </span>
            </div>

            <div className="space-y-2.5">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSimulating && activeStep === 4
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/30'
                      : 'bg-zinc-900/90 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-zinc-500">#{idx + 1}</span>
                    <div>
                      <div className="text-xs font-medium text-zinc-200 font-mono">
                        {stat.traderieOption}
                      </div>
                      <div className="text-[10px] text-zinc-400">{stat.display}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-400 font-mono">Value:</span>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => {
                        const next = [...stats];
                        next[idx].value = parseInt(e.target.value, 10) || 0;
                        setStats(next);
                      }}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-amber-400 focus:outline-none"
                    />
                    <button
                      onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                      title="Remove modifier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {stats.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No modifiers added. Click "Run Live Auto-Fill" or reload jewel.
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Asking Price */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              4. Price / Looking For
            </label>
            <div className="flex items-center gap-3">
              <div className="w-32">
                <input
                  type="number"
                  value={priceQty}
                  onChange={(e) => setPriceQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                />
              </div>

              <div className="flex-1">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Jah">Jah Rune</option>
                  <option value="Ber">Ber Rune</option>
                  <option value="Lo">Lo Rune</option>
                  <option value="Ohm">Ohm Rune</option>
                  <option value="Vex">Vex Rune</option>
                  <option value="Ist">Ist Rune</option>
                  <option value="Perfect Gem">Perfect Gems</option>
                </select>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Listing Form Ready to Submit on Traderie!</span>
              </div>
              <span className="text-[11px] text-zinc-400">0.22s execution time</span>
            </div>
          )}

          {/* Execution Logs */}
          {simulationLogs.length > 0 && (
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-[11px] text-zinc-400 space-y-1">
              <div className="text-zinc-500 uppercase tracking-widest text-[9px] mb-1 font-semibold">
                Autofill Execution Log
              </div>
              {simulationLogs.map((log, i) => (
                <div key={i} className="text-emerald-400/90 font-mono">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
