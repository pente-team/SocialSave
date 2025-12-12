import { GoogleGenAI } from "@google/genai";
import { SocialPost, Platform } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to detect platform from URL before sending to AI for faster UI feedback
export const detectPlatform = (url: string): Platform => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return Platform.Twitter;
  if (lowerUrl.includes('instagram.com')) return Platform.Instagram;
  if (lowerUrl.includes('tiktok.com')) return Platform.TikTok;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return Platform.YouTube;
  if (lowerUrl.includes('linkedin.com')) return Platform.LinkedIn;
  if (lowerUrl.includes('facebook.com')) return Platform.Facebook;
  return Platform.Unknown;
};

export const analyzeSocialUrl = async (url: string): Promise<SocialPost> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const detectedPlatform = detectPlatform(url);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Go to the following URL: ${url}
      
      Your task is to analyze this social media post and extract public metadata with high precision.
      
      Instructions:
      1. Use 'googleSearch' to retrieve the latest page content, title, and snippets.
      2. Extract the Author Name and Caption/Content.
      3. **Media URL Extraction (CRITICAL)**: 
         - Search aggressively for direct media links in the page metadata.
         - Look for <meta property="og:video">, <meta property="og:video:secure_url">, or <meta property="twitter:player:stream">.
         - Look for <meta property="og:image"> if it's an image post.
         - Check JSON-LD schema for "contentUrl" or "embedUrl".
         - If found, return the full valid URL.
         - Only return 'null' if the content is strictly behind a login wall that hides all metadata.
      
      Return a raw JSON object (no markdown) with this schema:
      {
        "author": "string",
        "content": "string (caption)",
        "hashtags": ["string"],
        "mediaType": "video" | "image" | "text" | "unknown",
        "mediaUrl": "string" | null,
        "likes": "string",
        "analysis": "string (brief summary)"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let jsonText = response.text || "{}";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(jsonText);
    } catch (e) {
        console.warn("Failed to parse JSON directly", jsonText);
        throw new Error("The AI response was not in valid JSON format.");
    }
    
    const post: SocialPost = {
      id: crypto.randomUUID(),
      url: url,
      platform: detectedPlatform,
      author: data.author || "Unknown Author",
      content: data.content || "Content not available",
      hashtags: data.hashtags || [],
      mediaType: (data.mediaType as any) || "unknown",
      mediaUrl: data.mediaUrl || undefined,
      likes: data.likes || "N/A",
      analysis: data.analysis || "Metadata extracted successfully.",
      thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(url.slice(-10))}/400/300` 
    };

    return post;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.message && error.message.includes("400")) {
      throw new Error("Invalid request. The URL might be malformed.");
    }
    throw new Error("Could not extract data. The post might be private, or the AI could not access the page content.");
  }
};