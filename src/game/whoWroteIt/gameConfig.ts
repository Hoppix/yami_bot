
import { TextChannel, GuildMember} from "discord.js";

export class gameConfig {

    public gameChannel: TextChannel;
    public dataChannels: Array<TextChannel>;
    public members: Array<GuildMember>;

    constructor(gameChannel : TextChannel, dataChannels: Array<TextChannel>, members: Array<GuildMember>) {
        this.gameChannel = gameChannel;
        this.dataChannels = dataChannels
        this.members = members;
    }

}