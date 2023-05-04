
import { TextChannel } from "discord.js";

export class gameConfig {

    gameChannel: TextChannel;
    dataChannels: Array<TextChannel>;
    members: Array<String>;

    constructor(gameChannel : TextChannel, dataChannels: Array<TextChannel>, members: Array<String>) {
        this.gameChannel = gameChannel;
        this.dataChannels = dataChannels
        this.members = members;
    }

}