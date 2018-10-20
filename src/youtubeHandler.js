/**
 * created by IrateGod on 20/10/2018
 */
var request = require('request');
var q = require('q');

/**
 * Look up a specified YouTube video. Only match the first result.
 *
 * @param aSearchQuery array of search keywords
 * @param apiKey YouTube API key
 */
function youtubeSearchRequest(aSearchQuery, apiKey)
{
	const defer = q.defer();
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
	request(oCall, function(err, response, source)
	{
		if (err && response !== 200)
		{
			defer.reject(
				{
					errorCode: response,
					message: err.message
				}
			);
		}
		else
		{
			defer.resolve(JSON.parse(source).items[0]);
		}
	});
	return defer.promise;
}

// exports
module.exports.youtubeSearchRequest = youtubeSearchRequest;
