import React, { useState } from 'react';
import { 
  Terminal, Copy, Check, Download, Settings, Play, 
  HelpCircle, ShieldAlert, Cpu, Sparkles 
} from 'lucide-react';
import { ScriptConfig } from '../types';
import { generatePythonScript } from '../utils/pythonScript';

interface ScriptViewerTabProps {
  config: ScriptConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScriptConfig>>;
}

export const ScriptViewerTab: React.FC<ScriptViewerTabProps> = ({ config, setConfig }) => {
  const [copied, setCopied] = useState(false);
  const pythonCode = generatePythonScript(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'd2r_traderie_pro.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 rounded-2xl p-5 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              Complete Rewritten Python Script (d2r_traderie_pro.py)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Every flaw of your original script has been fixed: no hardcoded Requirement 15 or Poison 20, robust DPI-aware cropping, full Exocet OCR dictionary, and a local Web Bridge for 100% reliable autofill.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Script!' : 'Copy Python Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Script Configuration Bar */}
      <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            Customize Script Settings
          </h3>
          <span className="text-[11px] text-zinc-500">
            Changes instantly reflect in the generated script below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Capture &amp; Scan Hotkey
            </label>
            <input
              type="text"
              value={config.hotkeyCapture}
              onChange={(e) => setConfig({ ...config, hotkeyCapture: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Fallback Typing Hotkey
            </label>
            <input
              type="text"
              value={config.hotkeyFill}
              onChange={(e) => setConfig({ ...config, hotkeyFill: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Local Bridge Server Port
            </label>
            <input
              type="number"
              value={config.serverPort}
              onChange={(e) => setConfig({ ...config, serverPort: parseInt(e.target.value, 10) || 8765 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Default Realm League
            </label>
            <select
              value={config.targetLeague}
              onChange={(e) => setConfig({ ...config, targetLeague: e.target.value as any })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="Non-Ladder">Non-Ladder</option>
              <option value="Ladder">Ladder</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">
            Tesseract OCR Path on Windows
          </label>
          <input
            type="text"
            value={config.tesseractPath}
            onChange={(e) => setConfig({ ...config, tesseractPath: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Quick Setup Instructions (3 steps) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">1</span>
            <span>Install Dependencies</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
            pip install opencv-python pillow pytesseract pyautogui keyboard pyperclip pygetwindow
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Install the standard Python imaging and input libraries on your PC.
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">2</span>
            <span>Run as Administrator</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300">
            python d2r_traderie_pro.py
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Run your terminal / PowerShell as Administrator so global hotkeys (F10) work while Diablo II is focused.
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px]">3</span>
            <span>Press F10 in D2R</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-[11px] text-emerald-400">
            F10 → Instant Traderie Auto-fill
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Hover mouse over jewel in D2R inventory and press F10. The bridge sends it to Traderie instantly!
          </p>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>d2r_traderie_pro.py</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[600px] leading-relaxed">
          <code>{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
};
