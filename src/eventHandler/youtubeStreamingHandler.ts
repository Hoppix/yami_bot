import { Quality, Ytdl } from "@distube/ytdl-core";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";

const ytdl = new Ytdl();

/**
 * handler for dealing with youtube streaming via ffmpeg codec
 */
const youtubeStreamingHandler = {
    _voiceConnection: null as VoiceConnection | null,

    /**
     *    bot joins the source voiceChannel
     *    and plays the youtubelink using the ytdl-core library.
     **/
    playYoutubeLink(sLink: string | undefined, oMessage: Message): void {
        if (!sLink) return;
        const channelId = oMessage.member?.voice.channelId;
        if (!oMessage.guild || !channelId) {
            oMessage.reply("You have to be in a voice channel to play something!");
            return;
        }

        // load stream via youtube, this is pretty simple by now
        const stream = ytdl.download(sLink, { quality: Quality.HighestAudio, filter: { hasAudio: true, hasVideo: false } });
        const player = createAudioPlayer();
        const youtubeStreamResource = createAudioResource(stream);

        // configure the connection
        console.log("channelId: ", channelId);
        console.log("guildId: ", oMessage.guildId);
        this._voiceConnection = joinVoiceChannel({
            channelId: channelId,
            guildId: oMessage.guild.id,
            adapterCreator: oMessage.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        this._voiceConnection.subscribe(player); //join VC and subscribe to the audio player
        player.play(youtubeStreamResource); //make sure "audioResource" is a valid audio resource
    },

    /**
     *    bot closes the the voiceConnection
     **/
    stopYoutubeLink(): void {
        if (this._voiceConnection) {
            this._voiceConnection.disconnect();
            this._voiceConnection.destroy();
            this._voiceConnection = null;
        }
    },
};

export default youtubeStreamingHandler;
