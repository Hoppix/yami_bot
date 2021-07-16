/**
 * Created by khopf on 10/01/2018.
 */
var request = require('request');

/**
 * Starts a scheduled Twitch-API poll for the @param sStreamer.
 * When @param sStreamer is online a message is send to the @param oChatChannel
 *
 * @param oChatChannel
 * @param sStreamer
 * @param apikey
 */
function pollStream(oChatChannel, sStreamer, apikey) {
    var bCallFlag = true;
    var iPollInterval = 10000;
    console.log("Interval set for " + sStreamer);

    setInterval(function() {
        //options for the REST-call
        const oCall = {
            uri: "https://api.twitch.tv/kraken/streams/" + sStreamer,
            port: 80,
            method: 'GET',
            headers: {
                "Client-ID": apikey,
                "Content-Type": "application/json"
            }
        };

        //fire request
        request(oCall, function(err, response, source) {
            if (err && response !== 200) {
                console.log("Returned wrong response code, this is what was logged: ");
                console.log(err);
            } else {
                var streamChannel;
                try {
                    streamChannel = JSON.parse(source);
                } catch (e) {
                    console.log("Request returned html content");
                    return;
                }

                //if stream is offline, continue polling normally and set the flag for sending the message
                if (streamChannel.stream === null || streamChannel.stream === undefined) {
                    bCallFlag = true;
                }
                //when stream is online, send message and set disable flag
                else if (bCallFlag) {
                    oChatChannel.send(sStreamer + " is currently online!");
                    oChatChannel.send(streamChannel.stream.channel.url);
                    bCallFlag = false;
                }
            }
        });
    }, iPollInterval);
}

//exports
module.exports.pollStream = pollStream;
