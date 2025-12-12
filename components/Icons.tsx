import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Facebook, 
  Link as LinkIcon, 
  Download, 
  Share2, 
  FileText,
  Video,
  Image as ImageIcon,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { Platform } from '../types';

export const PlatformIcon = ({ platform, className = "w-6 h-6" }: { platform: Platform | string, className?: string }) => {
  switch (platform) {
    case Platform.Twitter:
      return <Twitter className={`text-sky-400 ${className}`} />;
    case Platform.Instagram:
      return <Instagram className={`text-pink-500 ${className}`} />;
    case Platform.YouTube:
      return <Youtube className={`text-red-500 ${className}`} />;
    case Platform.LinkedIn:
      return <Linkedin className={`text-blue-600 ${className}`} />;
    case Platform.Facebook:
      return <Facebook className={`text-blue-500 ${className}`} />;
    case Platform.TikTok:
      // Lucide doesn't have a perfect TikTok icon, using Video as fallback or custom path if needed.
      // For simplicity in this demo, using Video with a specific color.
      return <Video className={`text-black dark:text-white ${className}`} />; 
    default:
      return <LinkIcon className={`text-gray-400 ${className}`} />;
  }
};

export { 
  Download, 
  Share2, 
  FileText, 
  Video, 
  ImageIcon, 
  Loader2, 
  Check, 
  LinkIcon,
  Copy 
};