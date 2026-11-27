/**
 * created by IrateGod on 20/10/2018
 */

const YOUTUBE_API_URL_BASE = "https://www.googleapis.com/youtube/v3/search";

export interface YoutubeSearchItem {
    id?: {
        kind?: string;
        videoId?: string;
        channelId?: string;
        playlistId?: string;
    };
    snippet?: Record<string, unknown>;
}

export interface YoutubeSearchError {
    errorCode: number;
    message: string;
}

/**
 * Look up a specified YouTube video. Only match the first result.
 *
 * @param aSearchQuery array of search keywords
 * @param apiKey YouTube API key
 * @throws YoutubeSearchError
 */
export async function youtubeSearchRequest(aSearchQuery: string[], apiKey: string): Promise<YoutubeSearchItem> {
    const url = new URL(YOUTUBE_API_URL_BASE);
    url.search = new URLSearchParams({
        maxResults: "1",
        part: "snippet",
        q: aSearchQuery.join(" "),
        key: apiKey,
    }).toString();

    let response: Response;
    try {
        response = await fetch(url, { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        throw { errorCode: 0, message: (err as Error).message } satisfies YoutubeSearchError;
    }

    if (!response.ok) {
        throw { errorCode: response.status, message: response.statusText } satisfies YoutubeSearchError;
    }

    const youtubeApiResponse = (await response.json()) as { items?: YoutubeSearchItem[] };
    if (!youtubeApiResponse.items || youtubeApiResponse.items.length === 0) {
        throw { errorCode: 204, message: "No videos found." } satisfies YoutubeSearchError;
    }
    return youtubeApiResponse.items[0];
}
