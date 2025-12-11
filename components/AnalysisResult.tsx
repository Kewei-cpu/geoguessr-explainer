import React, { useState } from 'react';
import { GeoLocationResult } from '../types';
import { MapPin, Target, Lightbulb, Globe, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalysisResultProps {
  result: GeoLocationResult;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm shadow-xl flex flex-col animate-fadeIn h-auto lg:h-full max-h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">识别位置</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              {result.country}
            </h2>
            {result.region && (
              <p className="text-gray-400 text-lg">{result.region}</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              <Target className="w-4 h-4" />
              <span className="font-bold">{result.confidence}%</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">置信度</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* Visual Cues */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            视觉线索
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.visualCues.map((cue, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 transition-colors cursor-default">
                {cue}
              </span>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            <Globe className="w-4 h-4 text-blue-500" />
            详细分析
          </h3>
          <p className="text-gray-300 leading-relaxed text-base">
            {result.explanation}
          </p>
        </div>

        {/* Thought Process (Collapsible) */}
        <div className="pt-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-all group"
          >
            <div className="flex items-center gap-2 text-purple-400">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-sm font-medium">AI 思考过程</span>
            </div>
            {isThoughtOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
            )}
          </button>
          
          {isThoughtOpen && (
            <div className="mt-2 p-4 bg-black/20 rounded-lg border border-gray-800 text-sm text-gray-400 font-mono whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-2 fade-in">
              {result.thoughtProcess}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};