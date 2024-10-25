/**
 * created by IrateGod on 20/10/2018
 */
import request from 'request';
import { defer as _defer } from 'q';

/**
 * Look up a specified YouTube video. Only match the first result.
 *
 * @param aSearchQuery array of search keywords
 * @param apiKey YouTube API key
 */
function youtubeSearchRequest(aSearchQuery, apiKey) {
    const defer = _defer();
    const YOUTUBE_API_URL_BASE = "https://www.googleapis.com/youtube/v3/search";
    const oCall = {
        uri: YOUTUBE_API_URL_BASE,
        qs: {
            maxResults: 1,
            part: "snippet",
            q: aSearchQuery.join(" "),
            key: apiKey
        },
        method: "GET",
        header: {
            "Content-Type": "application/json"
        }
    };
    request(oCall, function(err, response, source) {
        if (err && response !== 200) {
            defer.reject({
                errorCode: response,
                message: err.message || err.source
            });
        } else {
            const youtubeApiResponse = JSON.parse(source);
            if (!youtubeApiResponse.items || youtubeApiResponse.items.length === 0) {
                defer.reject({
                    errorCode: 204,
                    message: "No videos found."
                });
            } else {
                defer.resolve(youtubeApiResponse.items[0]);
            }
        }
    });
    return defer.promise;
}

// exports
const _youtubeSearchRequest = youtubeSearchRequest;
export { _youtubeSearchRequest as youtubeSearchRequest };
