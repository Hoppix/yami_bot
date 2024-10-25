const oUtility = require("../utility/utility.js");
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice")


/**
* handler for dealing with youtube streaming via ffmpeg codec
* @type {{}}
*/
module.exports = {

    _voiceConnection: null,

    /**
     *    bot joins the source voiceChannel
     *    and plays the youtubelink using the ytdl-core library.
     **/
    playYoutubeLink: function (sLink, oMessage, oClient) {

        // load stream via youtube, this is pretty simple by now
        const stream = ytdl(sLink, { filter: 'audioonly' })
        const player = createAudioPlayer()
        const youtubeStreamResource = createAudioResource(stream);

        // configure the connection
        console.log("channelId: ", oMessage.member.voice.channelId)
        console.log("guildId: ", oMessage.guildId)
        console.log("adapter: ", oMessage.guild.voiceAdapterCreator)
        this._voiceConnection = joinVoiceChannel({
            channelId: oMessage.member.voice.channelId,
            guildId: oMessage.guildId,
            adapterCreator: oMessage.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        this._voiceConnection.subscribe(player) //join VC and subscribe to the audio player
        player.play(youtubeStreamResource) //make sure "audioResource" is a valid audio resource
    },

    /**
     *    bot closes the the voiceConnection
     **/
    stopYoutubeLink: function (oClient) {
        if(this._voiceConnection) {
            this._voiceConnection.disconnect();
            this._voiceConnection.destroy();
            this._voiceConnection = null;
        }
    }
}