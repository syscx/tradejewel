import React, { useState } from 'react';
import { Globe, Copy, Check, Download, Bookmark, Zap, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { generateTampermonkeyScript, generateBookmarklet } from '../utils/userScript';

interface UserScriptTabProps {
  serverPort: number;
}

export const UserScriptTab: React.FC<UserScriptTabProps> = ({ serverPort }) => {
  const [copiedUserScript, setCopiedUserScript] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const userScriptCode = generateTampermonkeyScript(serverPort);
  const bookmarkletCode = generateBookmarklet(serverPort);

  const handleCopyUserScript = () => {
    navigator.clipboard.writeText(userScriptCode);
    setCopiedUserScript(true);
    setTimeout(() => setCopiedUserScript(false), 2000);
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  const handleDownloadUserScript = () => {
    const blob = new Blob([userScriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'traderie_d2r_autofill.user.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 rounded-2xl p-5 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              The 1-Click Traderie Web Bridge (Tampermonkey &amp; Bookmarklet)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            This browser companion completely eliminates the fragile blind <code className="text-amber-300">pyautogui.press('tab')</code> and <code className="text-amber-300">sleep(0.5)</code> keystrokes. It talks directly to your local Python bridge to fill Traderie forms in 0.1s!
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleCopyUserScript}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            {copiedUserScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUserScript ? 'Copied Userscript!' : 'Copy Userscript'}</span>
          </button>
        </div>
      </div>

      {/* Two Methods: Userscript vs Bookmarklet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Tampermonkey Userscript (Recommended) */}
        <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Method 1: Tampermonkey Userscript (Recommended)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Fully Automated
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              When you are on Traderie's create listing page, this userscript displays a small floating badge. As soon as you press <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-amber-400 rounded">F10</kbd> in D2R, it detects the new jewel and populates all categories, level reqs, modifiers, and prices without human interaction!
            </p>

            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">1</span>
                <span>Install the free <b>Tampermonkey</b> extension in Chrome, Edge, or Firefox.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">2</span>
                <span>Click "Create a new script" in Tampermonkey and paste the code below.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">3</span>
                <span>Open Traderie listing page. Done!</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
            <button
              onClick={handleCopyUserScript}
              className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition"
            >
              {copiedUserScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Userscript Code</span>
            </button>
            <button
              onClick={handleDownloadUserScript}
              className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition"
              title="Download .user.js file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Method 2: Zero-Install Browser Bookmarklet */}
        <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" />
                Method 2: Zero-Install Bookmarklet
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                No Extensions Needed
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Don't want to install browser extensions? Add this bookmarklet to your browser bookmarks bar. Whenever you are on Traderie, just click the bookmark once to fill the jewel from the Python bridge!
            </p>

            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">1</span>
                <span>Copy the bookmarklet code below.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">2</span>
                <span>Create a new browser bookmark named <b>"⚡ Fill D2R Jewel"</b> and paste this code as the URL.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 flex-shrink-0 mt-0.5">3</span>
                <span>Press F10 in game, switch to Traderie, and click the bookmark!</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <button
              onClick={handleCopyBookmarklet}
              className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition"
            >
              {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBookmarklet ? 'Copied Bookmarklet!' : 'Copy Bookmarklet Code (javascript:...)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Userscript Code Viewer */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>traderie_d2r_autofill.user.js</span>
          </div>
          <button
            onClick={handleCopyUserScript}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
          >
            {copiedUserScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUserScript ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[450px] leading-relaxed">
          <code>{userScriptCode}</code>
        </pre>
      </div>
    </div>
  );
};
