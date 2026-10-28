/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScannerTab } from './components/ScannerTab';
import { ScriptViewerTab } from './components/ScriptViewerTab';
import { UserScriptTab } from './components/UserScriptTab';
import { CodeComparisonTab } from './components/CodeComparisonTab';
import { TraderieSimulator } from './components/TraderieSimulator';
import { SAMPLE_JEWELS } from './data/sampleJewels';
import { ParsedJewel, ScriptConfig } from './types';
import { Sparkles, Terminal, Globe, ArrowRightLeft, Play } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'python' | 'userscript' | 'comparison' | 'simulator'>('scanner');
  const [activeJewel, setActiveJewel] = useState<ParsedJewel>(SAMPLE_JEWELS[0].parsed);

  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
    hotkeyCapture: 'f10',
    hotkeyFill: 'f9',
    tesseractPath: 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
    autoPriceEnabled: true,
    basePriceJah: 2,
    serverPort: 8765,
    targetLeague: 'Non-Ladder',
    targetMode: 'Softcore',
    targetPlatform: 'PC',
  });

  const handleSendToSimulator = (jewel: ParsedJewel) => {
    setActiveJewel(jewel);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* App Header */}
      <Header 
        activeTab={activeTab === 'simulator' ? 'scanner' : activeTab} 
        setActiveTab={(tab) => setActiveTab(tab)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Mode Switcher for Simulator */}
        {activeTab === 'simulator' && (
          <div className="flex items-center justify-between bg-zinc-900/90 px-4 py-2.5 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Viewing Live Traderie Simulator for: <b>{activeJewel.itemName}</b></span>
            </span>
            <button
              onClick={() => setActiveTab('scanner')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              ← Back to Scanner &amp; OCR
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'scanner' && (
          <ScannerTab
            onSendToSimulator={handleSendToSimulator}
            activeJewel={activeJewel}
            setActiveJewel={setActiveJewel}
          />
        )}

        {activeTab === 'simulator' && (
          <TraderieSimulator jewel={activeJewel} />
        )}

        {activeTab === 'python' && (
          <ScriptViewerTab
            config={scriptConfig}
            setConfig={setScriptConfig}
          />
        )}

        {activeTab === 'userscript' && (
          <UserScriptTab serverPort={scriptConfig.serverPort} />
        )}

        {activeTab === 'comparison' && (
          <CodeComparisonTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/90 py-6 mt-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>D2R to Traderie Auto-Lister Pro</span>
            <span>•</span>
            <span className="text-zinc-400">Exocet OCR + Local Bridge Architecture</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://traderie.com/diablo_2_resurrected"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              Traderie D2R Marketplace
            </a>
            <span>•</span>
            <span className="text-zinc-600">Built for Diablo II: Resurrected players</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
