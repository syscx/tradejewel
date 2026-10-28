import React, { useState } from 'react';
import { Sparkles, Terminal, Globe, ArrowRightLeft, ShieldCheck, Flame, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'python' | 'userscript' | 'comparison';
  setActiveTab: (tab: 'scanner' | 'python' | 'userscript' | 'comparison') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-red-950 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-zinc-100 tracking-wide font-serif">
                  D2R <span className="text-amber-400">→</span> Traderie Pro
                </h1>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                  v2.0 Architecture
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Diablo II: Resurrected Jewel Scanner, Exocet OCR &amp; 1-Click Auto-Lister
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scanner &amp; Bridge</span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'python'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Improved Python Script</span>
            </button>

            <button
              onClick={() => setActiveTab('userscript')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'userscript'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Traderie Userscript</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'comparison'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Before vs After</span>
            </button>
          </nav>

          {/* Quick Info Badge & How to Run Modal Trigger */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Run</span>
            </button>
            <span className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Blind Tabs</span>
            </span>
          </div>
        </div>
      </div>

      {/* How to Run Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-zinc-100 font-serif">
                  Quick Start Guide: Running D2R to Traderie Pro
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-1 rounded bg-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-400 uppercase tracking-wider block">
                  Method A: 1-Click Windows Batch (Easiest)
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Unzip your downloaded folder.</li>
                  <li>Double-click <code className="text-amber-300 bg-zinc-900 px-1 py-0.5 rounded">install_requirements.bat</code> to install packages.</li>
                  <li>Right-click <code className="text-amber-300 bg-zinc-900 px-1 py-0.5 rounded">run_assistant.bat</code> and select <b>"Run as administrator"</b> (admin rights needed for global F10 key hook).</li>
                </ol>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-blue-400 uppercase tracking-wider block">
                  Method B: Command Line (PowerShell / Terminal)
                </span>
                <div className="bg-zinc-900 p-2.5 rounded-lg font-mono text-[11px] text-zinc-200 space-y-1">
                  <div>cd path/to/extracted-folder</div>
                  <div>pip install -r requirements.txt</div>
                  <div>python d2r_traderie_pro.py</div>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl space-y-1.5 text-amber-200/90">
                <div className="font-semibold text-amber-300">🎮 Required Game &amp; Browser Setup:</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  <li>In D2R Options → Video: Set to <b>Windowed</b> or <b>Borderless Windowed</b>.</li>
                  <li>Install <b>Tampermonkey</b> extension in Chrome / Edge, then add <code className="text-amber-300">traderie_d2r_autofill.user.js</code> (or use the Bookmarklet).</li>
                  <li>Hover mouse over any jewel in D2R and press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400">F10</kbd>.</li>
                  <li>Switch to Traderie listing page — it auto-fills all fields in 0.2s!</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-xl text-xs font-bold transition"
              >
                Got It, Let's Trade!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
