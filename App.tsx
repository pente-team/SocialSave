import React, { useState, useEffect } from 'react';
import { detectPlatform, analyzeSocialUrl } from './services/gemini';
import { SocialPost, AnalysisState } from './types';
import { PlatformIcon, Loader2, Download } from './components/Icons';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';

export default function App() {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('unknown');
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    data: null,
  });
  const [history, setHistory] = useState<SocialPost[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('socialSaveHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Update detected platform as user types
  useEffect(() => {
    if (url) {
      setDetectedPlatform(detectPlatform(url));
    } else {
      setDetectedPlatform('unknown');
    }
  }, [url]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setState({ loading: true, error: null, data: null });

    try {
      const result = await analyzeSocialUrl(url);
      
      setState({
        loading: false,
        error: null,
        data: result
      });

      // Update history
      const newHistory = [result, ...history.filter(h => h.url !== result.url)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('socialSaveHistory', JSON.stringify(newHistory));

    } catch (error: any) {
      setState({
        loading: false,
        error: error.message || "Something went wrong. Please check the URL and try again.",
        data: null
      });
    }
  };

  const handleHistorySelect = (post: SocialPost) => {
    setUrl(post.url);
    setState({
      loading: false,
      error: null,
      data: post
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('socialSaveHistory');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center p-4 md:p-8 font-sans selection:bg-primary/30">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-40"></div>
      </div>

      {/* Header */}
      <header className="text-center mb-12 mt-8 animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-4 shadow-lg border border-white/5 backdrop-blur-sm">
           <Download className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-4 tracking-tight">
          SocialSave <span className="text-primary">AI</span>
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
          Instantly analyze and archive social media posts. Extract metadata, captions, and links with the power of Gemini.
        </p>
      </header>

      {/* Input Section */}
      <div className="w-full max-w-2xl relative z-10">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex items-center bg-surface rounded-xl p-2 shadow-2xl border border-gray-700/50">
            
            <div className="pl-4 pr-3 text-gray-400 border-r border-gray-700">
              <PlatformIcon platform={detectedPlatform} className="w-6 h-6 transition-all duration-300" />
            </div>
            
            <input 
              type="text" 
              placeholder="Paste a link from Instagram, X, TikTok..."
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-500 w-full min-w-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button 
              type="submit"
              disabled={state.loading || !url}
              className={`mr-1 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2
                ${state.loading || !url 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
            >
              {state.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Error Message */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center animate-shake">
            {state.error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {state.data && <ResultCard post={state.data} />}

      {/* History Section */}
      {!state.data && !state.loading && (
        <HistoryList 
          history={history} 
          onSelect={handleHistorySelect}
          onClear={handleClearHistory} 
        />
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-8 text-center text-xs text-gray-600">
        <p>SocialSave AI uses Gemini 2.5 Flash to extract public metadata.</p>
        <p>Respect copyright and platform terms of service.</p>
      </footer>
    </div>
  );
}