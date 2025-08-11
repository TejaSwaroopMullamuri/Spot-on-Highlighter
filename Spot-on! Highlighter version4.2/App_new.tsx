declare const chrome: any;

import React, { useState, useEffect } from 'react';
import Controls from './components/Controls';
import { FALLBACK_DEFAULT_HIGHLIGHT_COLOR } from './constants';

const App: React.FC = () => {
  const [isSpotlightOn, setIsSpotlightOn] = useState(false);
  const [selectedColor, setSelectedColor] = useState(FALLBACK_DEFAULT_HIGHLIGHT_COLOR);
  const [hostname, setHostname] = useState<string | null>(null);
  const [isSiteColorSet, setIsSiteColorSet] = useState(false);
  const [isGlobalDefaultDifferent, setIsGlobalDefaultDifferent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    getCurrentTabHostname();
  }, []);

  const loadSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await new Promise<any>((resolve) => {
          chrome.storage.local.get(['isSpotlightOn', 'defaultHighlightColorValue', 'siteColorSettings'], resolve);
        });

        const globalDefault = result.defaultHighlightColorValue || FALLBACK_DEFAULT_HIGHLIGHT_COLOR;
        const siteSettings = result.siteColorSettings || {};
        const currentHostname = hostname;
        const siteColor = currentHostname ? siteSettings[currentHostname] : null;
        
        setIsSpotlightOn(result.isSpotlightOn || false);
        setSelectedColor(siteColor || globalDefault);
        setIsSiteColorSet(!!siteColor);
        setIsGlobalDefaultDifferent(siteColor !== globalDefault);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const getCurrentTabHostname = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.url) {
          const url = new URL(activeTab.url);
          setHostname(url.hostname);
        }
      } catch (error) {
        console.error('Error getting hostname:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-400 to-neon-600 flex items-center justify-center animate-glow">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Spot On!</h1>
            <p className="text-xs text-slate-400 -mt-0.5">Smart Highlighter</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Controls
        isSpotlightOn={isSpotlightOn}
        onToggle={() => setIsSpotlightOn(!isSpotlightOn)}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        onSetGlobalDefault={() => {}}
        onClearSiteSpecific={() => {}}
        isSiteColorSet={isSiteColorSet}
        isGlobalDefaultDifferent={isGlobalDefaultDifferent}
        hostname={hostname}
      />
    </div>
  );
};

export default App;
