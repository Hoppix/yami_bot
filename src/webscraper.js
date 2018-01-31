/**
 * Created by khopf on 10/01/2018.
 */
var request = require('request');

/**
 *    returns: promise
 * request url and retrieves the html content as string
 **/
function scrapeUrl(sUrl)
{
	const deferred = q.defer();
	request(sUrl, function (err, response, html)
	{
		if (err && response !== 200)
		{
			console.log("Something happened when scraping " + sUrl);
			console.log(err);
			deferred.reject(err);
		}
		else
		{
			deferred.resolve(html);
		}
	});
	return deferred.promise;
}

function pollStream(oChatChannel, sStreamer, apikey)
{
	var bCallFlag = true;
	console.log("Interval set for " + sStreamer);

	setInterval(function ()
	{
		const oCall = {
			uri: "https://api.twitch.tv/kraken/streams/" + sStreamer,
			port: 80,
			method: 'GET',
			headers:
			{
				"Client-ID": apikey,
				"Content-Type": "application/json"
			}
		};

		request(oCall, function (err, response, source)
		{
			if (err && response !== 200)
			{
				console.log("error logged")
				console.log(err);
			}
			else
			{
				var streamChannel;
				try
				{
					streamChannel = JSON.parse(source);
				}
				catch (e)
				{
					console.log("Request returned html content");
					return;
				}

				if (streamChannel.stream === null || streamChannel.stream === undefined)
				{
					bCallFlag = true;
				}
				else if (bCallFlag)
				{
					oChatChannel.send(sStreamer + " is currently online!");
					oChatChannel.send(streamChannel.stream.channel.url);
					bCallFlag = false;
				}
			}
		});
	}, 10000);
}

module.exports.scrapeUrl = scrapeUrl;
module.exports.pollStream = pollStream;
