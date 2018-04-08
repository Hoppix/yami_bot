/**
 * Created by khopf on 10/01/2018.
 */
const request = require('request');
const utility = require('./utility.js');


/**
 * Starts a scheduled Twitch-API poll for the @param sStreamer.
 *
 * When @param sStreamer is online a message is send to the @param oChatChannel
 *
 * @param oChatChannel
 * @param sStreamer
 * @param apikey
 */
function pollStream(oChatChannel, sStreamer, apikey)
{
	//request every 10 seconds
	const iPollInterval = 10000;
	var bCallFlag = true;
	console.log("Interval set for " + sStreamer);

	setInterval(function ()
	{
		//options for the REST-call
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

		//fire request
		request(oCall, function (err, response, source)
		{
			if (err && response !== 200)
			{
				console.log("Logged HTTP error with response code: " + response);
				console.log("Following error was logged: ");
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
					console.log("Error was logged during JSON-parse: ");
					e.message;
					return;
				}

				//if stream is offline, continue polling normally and set the flag for sending the message
				if (streamChannel.stream === null || streamChannel.stream === undefined)
				{
					bCallFlag = true;
				}
				//when stream is online, send message and set disable flag
				else if (bCallFlag)
				{
					oChatChannel.send(sStreamer + " is currently streaming: " + streamChannel.stream.channel.url);
					bCallFlag = false;
				}
			}
		});
	}, iPollInterval);
}

module.exports.pollStream = pollStream;
