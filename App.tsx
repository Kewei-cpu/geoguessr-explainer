import React, { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, Map as MapIcon, Image as ImageIcon, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { analyzeImageLocation } from './services/geminiService';
import { AppStatus, GeoLocationResult } from './types';
import { MapDisplay } from './components/MapDisplay';
import { AnalysisResult } from './components/AnalysisResult';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<GeoLocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请上传有效的图片文件。');
      return;
    }

    // Reset state
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async () => {
    if (!imagePreview || !fileInputRef.current?.files?.[0]) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);

    try {
      const file = fileInputRef.current.files[0];
      const base64Data = imagePreview.split(',')[1];
      const mimeType = file.type;

      const analysisResult = await analyzeImageLocation(base64Data, mimeType);
      setResult(analysisResult);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '分析位置失败。请重试。');
      setStatus(AppStatus.ERROR);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetApp = () => {
    setImagePreview(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasResult = !!result;

  return (
    <div className="h-screen w-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              GeoGuessr <span className="text-blue-400 font-light">AI 助手</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                <Sparkles className="w-3 h-3" />
                由 Gemini 3 Pro 提供支持
             </div>
             {result && (
                <button 
                  onClick={resetApp}
                  className="lg:hidden p-2 text-gray-400 hover:text-white"
                  title="重新开始"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full">
          
          {/* LEFT COLUMN */}
          <div className={`flex flex-col gap-4 ${hasResult ? 'lg:col-span-4' : 'lg:col-span-4'} lg:h-full overflow-y-auto lg:overflow-visible pr-2 lg:pr-0`}>
            
            {/* Top Section: Image & Controls */}
            <div className="flex flex-col gap-4 shrink-0">
              {/* Upload Area */}
              <div 
                className={`
                  relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden shrink-0
                  ${!imagePreview 
                    ? 'border-gray-700 bg-gray-900/50 hover:border-blue-500/50 hover:bg-gray-800/50 h-64 flex flex-col items-center justify-center cursor-pointer' 
                    : 'border-gray-700 bg-black h-auto aspect-video shadow-lg'}
                `}
                onClick={!imagePreview ? triggerUpload : undefined}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />

                {!imagePreview ? (
                  <>
                    <div className="p-4 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors mb-4">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-gray-300 font-medium">点击上传街景图片</p>
                    <p className="text-gray-500 text-sm mt-1">支持 JPG, PNG, WEBP</p>
                  </>
                ) : (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Street View Preview" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {status !== AppStatus.ANALYZING && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
                        className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 text-white border border-white/10 transition-colors pointer-events-auto z-10"
                        title="更换图片"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-4 shrink-0">
                {status === AppStatus.ERROR && error && (
                  <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                {(!result || status === AppStatus.ANALYZING) && (
                  <button
                      onClick={handleAnalyze}
                      disabled={!imagePreview || status === AppStatus.ANALYZING}
                      className={`
                        w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                        ${!imagePreview 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                          : status === AppStatus.ANALYZING
                            ? 'bg-blue-600/50 text-white cursor-wait'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform hover:scale-[1.02] hover:shadow-blue-500/25'
                        }
                      `}
                  >
                      {status === AppStatus.ANALYZING ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          开始识别
                        </>
                      )}
                  </button>
                )}
                
                {result && (
                    <button
                      onClick={resetApp}
                      className="lg:hidden w-full py-3 px-6 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      上传新图片
                    </button>
                )}
              </div>
              
               {/* Instructions - Only show when idle and map is on the right */}
              {!hasResult && status === AppStatus.IDLE && (
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wide">如何使用</h3>
                  <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
                    <li>上传 Google 街景截图或照片。</li>
                    <li>Gemini 3 Pro 分析植被、道路标线和建筑特征。</li>
                    <li>在地图上获得精确推测及详细解析。</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Map Section - MOVED TO BOTTOM LEFT ONLY WHEN RESULT EXISTS */}
            {hasResult && (
              <div className={`
                  w-full rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 relative z-0
                  transition-all duration-500 ease-in-out flex-1 min-h-[300px]
              `}>
                 <MapDisplay result={result} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className={`lg:h-full lg:overflow-hidden flex flex-col min-h-0 ${hasResult ? 'lg:col-span-8' : 'lg:col-span-8'}`}>
            
            {/* Condition: Result Exists -> Show Analysis Panel */}
            {hasResult ? (
              <div className="h-full animate-in slide-in-from-bottom-10 duration-500 fade-in flex flex-col">
                <AnalysisResult result={result} />
              </div>
            ) : (
              /* Condition: No Result -> Show Large Map (Original Layout) */
               <div className="hidden lg:block h-full w-full rounded-xl overflow-hidden border border-gray-800 bg-gray-900 relative shadow-inner">
                  <MapDisplay result={null} />
                  <div className="absolute inset-0 bg-black/10 pointer-events-none z-[400]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[401]">
                    <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <MapIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">等待分析结果...</span>
                    </div>
                  </div>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;