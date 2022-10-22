const oUtility = require("../utility/utility.js");
const ytdl = require('ytdl-core');
const discordVoice = require("@discordjs/voice")


/**
* handler for dealing with youtube streaming via ffmpeg codec
* @type {{}}
*/
module.exports = {
    
    /**
     *    bot joins the source voiceChannel
     *    and plays the youtubelink using the ytdl-core library.
     **/
     playYoutubeLink: function(sLink, oMessage, oClient) {
        if (!sLink) return;
        if (!oMessage.member) return;
        if (!oMessage.member.voice.channel) return;

        var oTargetChannel = oMessage.member.voice.channel;

        if (!oTargetChannel) return;

        // Play streams using ytdl-core
        var broadcast = oClient.voice.createBroadcast();
        var streamOptions = {
            seek: 0,
            volume: 1
        };

        console.log("Playing youtube link: ", sLink, " in channel ");
        oTargetChannel.join()
            .then(connection => {
                var stream = ytdl(sLink, {
                    filter: 'audioonly'
                });

                broadcast.play(stream, streamOptions);
                var dispatcher = connection.play(broadcast);
            })
            .catch(console.error);
    },

    /**
     *    bot closes the all voiceConnections and leaves all channels.
     **/
    stopYoutubeLink: function(oClient) {
        const mConnections = oClient.voice.connections;
        for (const oConnection of mConnections.values()) {
            const oChannel = oConnection.channel;
            if (!oChannel) continue;
            oChannel.leave()
        };
    }
}