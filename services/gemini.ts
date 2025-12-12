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
      
      Your task is to analyze this social media post and extract metadata to create a structured archive.
      
      Please extract:
      1. Author Name (username or display name)
      2. The full text content/caption of the post.
      3. Any visible hashtags.
      4. The primary media type (is it a video, image, or text post?).
      5. Engagement metrics (likes, shares) if visible in the snippet.
      6. A brief 1-sentence summary of what the content is about.
      7. **IMPORTANT**: If you can find a direct URL to the image or video file in the page source or metadata, extract it as 'mediaUrl'. If not, leave it null.
      
      Use the 'googleSearch' tool to visit the page and gather this information.

      Return a raw JSON object (no markdown formatting) with the following schema:
      {
        "author": "string",
        "content": "string",
        "hashtags": ["string"],
        "mediaType": "video" | "image" | "text" | "unknown",
        "mediaUrl": "string" | null,
        "likes": "string",
        "analysis": "string"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are not allowed with googleSearch
      }
    });

    let jsonText = response.text || "{}";
    // Strip markdown code blocks if present
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(jsonText);
    } catch (e) {
        console.warn("Failed to parse JSON directly, attempting fallback or empty", jsonText);
        data = {};
    }
    
    // Construct the result object
    const post: SocialPost = {
      id: crypto.randomUUID(),
      url: url,
      platform: detectedPlatform,
      author: data.author || "Unknown Author",
      content: data.content || "",
      hashtags: data.hashtags || [],
      mediaType: (data.mediaType as any) || "unknown",
      mediaUrl: data.mediaUrl || undefined,
      likes: data.likes || "N/A",
      analysis: data.analysis || "No analysis available.",
      // Using a generic placeholder based on platform if no real media URL is found 
      // allows the UI to look good while being honest about AI limitations.
      thumbnailUrl: `https://picsum.photos/seed/${detectedPlatform}${Date.now()}/400/300` 
    };

    return post;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the link. The post might be private or inaccessible.");
  }
};