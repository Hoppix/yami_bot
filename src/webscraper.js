/**
 * Created by khopf on 10/01/2018.
 */
var request = require('request');
const utility = require('./utility.js');


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
			headers: {"Client-ID": apikey}
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
				const streamChannel = JSON.parse(source);
				if (streamChannel.stream === null)
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
	//1000*60*3
}

module.exports.pollStream = pollStream;
