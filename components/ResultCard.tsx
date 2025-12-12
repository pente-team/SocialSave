import React, { useState } from 'react';
import { SocialPost, Platform } from '../types';
import { PlatformIcon, Download, Copy, Check, Video, ImageIcon, FileText, Share2, LinkIcon } from './Icons';

interface ResultCardProps {
  post: SocialPost;
}

export const ResultCard: React.FC<ResultCardProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyCaption = () => {
    if (post.content) {
      navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadArchive = () => {
    setDownloading(true);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(post, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `social-save-${post.platform}-${post.id.slice(0, 8)}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(false);
    }, 800);
  };

  // Smart Downloader Logic
  const getDownloadAction = () => {
    // Priority 1: Direct Link (if extracted by AI)
    if (post.mediaUrl) {
      return {
        label: "Download Media",
        url: post.mediaUrl,
        icon: <Download className="w-5 h-5" />,
        isExternal: false
      };
    }

    // Priority 2: Trusted 3rd Party Fallbacks
    switch (post.platform) {
      case Platform.TikTok:
        return { name: "SSSTik", url: "https://ssstik.io/en" };
      case Platform.Instagram:
        return { name: "SnapInsta", url: "https://snapinsta.app/" };
      case Platform.Twitter:
        return { name: "TwitterVid", url: "https://twittervideodownloader.com/" };
      case Platform.YouTube:
        // YouTube allows pre-filling the URL in some tools
        return { 
          name: "SaveFrom", 
          url: `https://en.savefrom.net/1-youtube-video-downloader-434/?url=${encodeURIComponent(post.url)}` 
        };
      case Platform.Facebook:
        return { name: "FDown", url: "https://fdown.net/" };
      default:
        return { name: "External Tool", url: post.url }; // Fallback to original URL if unknown
    }
  };

  const fallbackTool = !post.mediaUrl ? getDownloadAction() : null;

  const handleMainAction = () => {
    if (post.mediaUrl) {
      window.open(post.mediaUrl, '_blank');
    } else if (fallbackTool && 'url' in fallbackTool) {
      window.open(fallbackTool.url as string, '_blank');
    }
  };

  return (
    <div className="w-full max-w-2xl bg-surface border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl mt-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
             <PlatformIcon platform={post.platform} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">
              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
            </h3>
            <p className="text-xs text-gray-500">{post.author}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
             {post.mediaType.toUpperCase()}
           </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Visual & Downloads */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700 group">
             {/* Thumbnail / Placeholder */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
             <img 
               src={post.thumbnailUrl} 
               alt="Post Thumbnail" 
               className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
             />
             <div className="absolute bottom-4 left-4 right-4 z-20">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {post.analysis}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
                   {post.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                   <span>{post.likes} Likes</span>
                </div>
             </div>
          </div>
          
          {/* Unified Smart Action Button */}
          <button 
            onClick={handleMainAction}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg 
              ${post.mediaUrl 
                ? 'bg-primary hover:bg-blue-600 text-white shadow-blue-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}`}
          >
            {post.mediaUrl ? <Download className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            {post.mediaUrl ? "Download Media" : `Download via ${(fallbackTool as any).name}`}
          </button>
          
          {/* Subtle info text instead of warning box */}
          {!post.mediaUrl && (
             <div className="text-center">
                <p className="text-[10px] text-gray-500">
                   Direct link protected. Redirecting to external downloader.
                </p>
             </div>
          )}
        </div>

        {/* Right Column: Content & Metadata */}
        <div className="flex flex-col h-full">
           <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 relative">
             <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption</span>
                <button 
                  onClick={handleCopyCaption}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Copy Caption"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                </button>
             </div>
             <p className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 custom-scrollbar">
               {post.content || "No caption found."}
             </p>
             
             {post.hashtags && post.hashtags.length > 0 && (
               <div className="mt-4 flex flex-wrap gap-1.5">
                 {post.hashtags.map((tag, i) => (
                   <span key={i} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                     {tag.startsWith('#') ? tag : `#${tag}`}
                   </span>
                 ))}
               </div>
             )}
           </div>

           <div className="mt-4">
             <button
                onClick={handleDownloadArchive}
                disabled={downloading}
                className="w-full py-2.5 px-4 rounded-xl bg-surface border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center gap-2 text-sm font-medium transition-colors"
             >
                {downloading ? (
                  <span className="animate-pulse">Generating Archive...</span>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Download JSON Archive
                  </>
                )}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};