import type { ApiData } from "@prisma/client";

export interface SocialMediaStats {
  followers: number;
  likes: number;
  views: number;
  posts: number;
}

export interface ApiCredentials {
  youtubeApiKey?: string;
  facebookAccessToken?: string;
  instagramAccessToken?: string;
  tiktokAccessToken?: string;
  pinterestAccessToken?: string;
}

export async function fetchYouTubeStats(
  apiKey: string,
  channelName: string
): Promise<SocialMediaStats | { error: string }> {
  try {
    // Step 1: Search for channel by name
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { error: "Channel not found" };
    }

    const channelId = searchData.items[0].snippet.channelId;

    // Step 2: Get channel statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    if (!statsData.items || statsData.items.length === 0) {
      return { error: "No statistics found" };
    }

    const stats = statsData.items[0].statistics;
    
    return {
      followers: parseInt(stats.subscriberCount || "0"),
      likes: 0, // YouTube API doesn't provide total likes across all videos
      views: parseInt(stats.viewCount || "0"),
      posts: parseInt(stats.videoCount || "0"),
    };
  } catch (error) {
    return { error: `YouTube API error: ${error}` };
  }
}

export async function fetchInstagramStats(
  accessToken: string,
  username: string
): Promise<SocialMediaStats | { error: string }> {
  try {
    // Instagram Basic Display API
    const url = `https://graph.instagram.com/me?fields=account_type,media_count&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return { error: `Instagram API error: ${data.error.message}` };
    }

    // Get media for likes count (simplified - would need pagination for accurate count)
    const mediaUrl = `https://graph.instagram.com/me/media?fields=like_count&access_token=${accessToken}`;
    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    const totalLikes = mediaData.data?.reduce((sum: number, media: any) => 
      sum + (media.like_count || 0), 0) || 0;

    return {
      followers: 0, // Requires Instagram Graph API with special permissions
      likes: totalLikes,
      views: 0, // Not available in basic API
      posts: data.media_count || 0,
    };
  } catch (error) {
    return { error: `Instagram API error: ${error}` };
  }
}

export async function fetchFacebookStats(
  accessToken: string,
  pageId: string
): Promise<SocialMediaStats | { error: string }> {
  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return { error: `Facebook API error: ${data.error.message}` };
    }

    return {
      followers: data.fan_count || data.followers_count || 0,
      likes: 0, // Would need additional API calls to aggregate post likes
      views: 0, // Not directly available
      posts: 0, // Would need additional API call
    };
  } catch (error) {
    return { error: `Facebook API error: ${error}` };
  }
}

export async function fetchTikTokStats(
  accessToken: string,
  username: string
): Promise<SocialMediaStats | { error: string }> {
  try {
    // TikTok Research API (simplified example)
    const url = `https://open.tiktokapis.com/v2/research/user/info/?username=${username}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (data.error) {
      return { error: `TikTok API error: ${data.error.message}` };
    }

    return {
      followers: data.data?.follower_count || 0,
      likes: data.data?.heart_count || 0,
      views: data.data?.video_view_count || 0,
      posts: data.data?.video_count || 0,
    };
  } catch (error) {
    return { error: `TikTok API error: ${error}` };
  }
}

export async function fetchPinterestStats(
  accessToken: string,
  username: string
): Promise<SocialMediaStats | { error: string }> {
  try {
    // Pinterest API v5
    const url = `https://api.pinterest.com/v5/user_account?ad_account_id=${username}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (data.error) {
      return { error: `Pinterest API error: ${data.error.message}` };
    }

    return {
      followers: data.follower_count || 0,
      likes: 0, // Not directly available
      views: data.monthly_views || 0,
      posts: data.pin_count || 0,
    };
  } catch (error) {
    return { error: `Pinterest API error: ${error}` };
  }
}

export async function fetchAllPlatformStats(
  credentials: ApiCredentials,
  platforms: Array<{ platformId: string; profileName: string }>
): Promise<Record<string, SocialMediaStats | { error: string }>> {
  const results: Record<string, SocialMediaStats | { error: string }> = {};

  for (const platform of platforms) {
    const { platformId, profileName } = platform;

    switch (platformId) {
      case "youtube":
        if (credentials.youtubeApiKey) {
          results[platformId] = await fetchYouTubeStats(credentials.youtubeApiKey, profileName);
        } else {
          results[platformId] = { error: "YouTube API key not configured" };
        }
        break;

      case "instagram":
        if (credentials.instagramAccessToken) {
          results[platformId] = await fetchInstagramStats(credentials.instagramAccessToken, profileName);
        } else {
          results[platformId] = { error: "Instagram access token not configured" };
        }
        break;

      case "facebook":
        if (credentials.facebookAccessToken) {
          results[platformId] = await fetchFacebookStats(credentials.facebookAccessToken, profileName);
        } else {
          results[platformId] = { error: "Facebook access token not configured" };
        }
        break;

      case "tiktok":
        if (credentials.tiktokAccessToken) {
          results[platformId] = await fetchTikTokStats(credentials.tiktokAccessToken, profileName);
        } else {
          results[platformId] = { error: "TikTok access token not configured" };
        }
        break;

      case "pinterest":
        if (credentials.pinterestAccessToken) {
          results[platformId] = await fetchPinterestStats(credentials.pinterestAccessToken, profileName);
        } else {
          results[platformId] = { error: "Pinterest access token not configured" };
        }
        break;

      default:
        results[platformId] = { error: "Platform not supported for API mode" };
    }
  }

  return results;
}