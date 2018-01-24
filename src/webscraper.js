/**
 * Created by khopf on 10/01/2018.
 */
var request = require('request');
var q = require('q');

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

	setInterval(function ()
	{
		const oCall = {
			uri: "https://api.twitch.tv/kraken/streams/" + sStreamer,
			port: 80,
			method: 'GET',
			headers: {"Client-ID": apikey}
		};

		request(oCall, function (err, response, source)
		{
			if (err && response !== 200)
			{
				console.log(err);
			}
			else
			{
				const streamChannel = JSON.parse(source);
				if (streamChannel.stream === null)
				{
					oChatChannel.send(sStreamer + " is currently offline.");
					bCallFlag = true;

				} else if (bCallFlag)
				{
					oChatChannel.send(sStreamer + " is currently online!");
					oChatChannel.send(streamChannel.stream.channel.url);
					bCallFlag = false;
				}
			}
		});
	}, 1000*60*3);
}

module.exports.scrapeUrl = scrapeUrl;
module.exports.pollStream = pollStream;
