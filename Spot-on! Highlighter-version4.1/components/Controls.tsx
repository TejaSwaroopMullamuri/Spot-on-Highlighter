
import React from 'react';

interface ControlsProps {
  isSpotlightOn: boolean;
  onToggle: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  onSetGlobalDefault: () => void;
  onClearSiteSpecific: () => void;
  isSiteColorSet: boolean;
  isGlobalDefaultDifferent: boolean;
  hostname: string | null;
}

const Controls: React.FC<ControlsProps> = ({
  isSpotlightOn,
  onToggle,
  selectedColor,
  onColorChange,
  onSetGlobalDefault,
  onClearSiteSpecific,
  isSiteColorSet,
  isGlobalDefaultDifferent,
  hostname,
}) => {
  return (
    <div className="space-y-3">
      {/* Neural Network Toggle */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
        <div className="relative bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isSpotlightOn 
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50' 
                    : 'bg-slate-700 border border-slate-600'
                }`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {isSpotlightOn && (
                  <div className="absolute -inset-1 bg-cyan-400 rounded-lg blur opacity-30 animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">NEURAL LINK</h3>
                <p className="text-[10px] text-cyan-300 uppercase tracking-widest">{isSpotlightOn ? 'ACTIVE' : 'STANDBY'}</p>
              </div>
            </div>
            
            {/* Futuristic Toggle */}
            <button
              onClick={onToggle}
              className="relative group focus:outline-none"
            >
              <div className={`w-12 h-6 rounded-full border-2 transition-all duration-300 ${
                isSpotlightOn 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 shadow-lg shadow-cyan-500/50' 
                  : 'bg-slate-700 border-slate-600'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                  isSpotlightOn 
                    ? 'left-6 bg-white shadow-lg' 
                    : 'left-0.5 bg-slate-400'
                }`}>
                  {isSpotlightOn && (
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur opacity-60 animate-pulse"></div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Color Matrix */}
      {isSpotlightOn && (
        <div className="relative animate-in slide-in-from-top-2 duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 space-y-3">
            
            {/* Color Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div 
                    className="w-6 h-6 rounded-lg border-2 border-white/30 shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <div className="absolute inset-0 rounded-lg shadow-inner"></div>
                  </div>
                  <div className="absolute -inset-0.5 rounded-lg opacity-50 animate-pulse" 
                       style={{ backgroundColor: selectedColor, filter: 'blur(3px)' }}></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">COLOR MATRIX</h4>
                  <p className="text-[10px] text-purple-300 font-mono">{selectedColor.toUpperCase()}</p>
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="relative">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-8 h-8 rounded-lg border-2 border-purple-400/50 cursor-pointer bg-transparent hover:border-purple-400 transition-all duration-300"
                />
                <div className="absolute -inset-0.5 bg-purple-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSetGlobalDefault}
                disabled={!isGlobalDefaultDifferent}
                className="relative group overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-2 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest">
                  Set Global
                </div>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
              
              {hostname && isSiteColorSet ? (
                <button
                  onClick={onClearSiteSpecific}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative px-2 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest">
                    Reset Site
                  </div>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </button>
              ) : (
                <button
                  disabled
                  className="relative overflow-hidden rounded-lg opacity-40 cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700"></div>
                  <div className="relative px-2 py-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Site Default
                  </div>
                </button>
              )}
            </div>
            
            {/* Site Info */}
            {hostname && (
              <div className="pt-1 border-t border-white/10">
                <p className="text-[10px] text-slate-400 text-center">
                  {isSiteColorSet ? `Custom color for ${hostname}` : `Using global default for ${hostname}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;