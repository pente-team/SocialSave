import React from 'react';
import { SocialPost } from '../types';
import { PlatformIcon, FileText } from './Icons';

interface HistoryListProps {
  history: SocialPost[];
  onSelect: (post: SocialPost) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Recent Analyses</h3>
        <button 
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {history.map((post) => (
          <div 
            key={post.id}
            onClick={() => onSelect(post)}
            className="flex items-center gap-4 p-3 rounded-lg bg-surface border border-gray-700/50 hover:border-primary/50 cursor-pointer transition-all hover:bg-gray-800 group"
          >
            <div className="p-2 rounded-full bg-gray-900/50 border border-gray-700">
               <PlatformIcon platform={post.platform} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {post.author || post.url}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {post.analysis || post.content || "No description"}
              </p>
            </div>
            <div className="text-xs text-gray-600 group-hover:text-primary transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};