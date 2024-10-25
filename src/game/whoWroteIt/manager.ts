import { Message, ChannelType, TextChannel, GuildMember, Guild } from "discord.js";

import { game } from "./game"
import { gameConfig } from "./gameConfig"
import { wwiState } from "./state";
import { isSameUserName } from "../../utility/utility";

class gameManager {

    private games: Map<string, game>;
    private static ABORT_COMMAND: string = "abort"

    constructor() {
        this.games = new Map();
    }

    public delegate(message: any) {
        if (!message || !(message instanceof Message)) throw new Error("Message can't be null!");

        if (!message.guild || !message.channel || !(message.channel instanceof TextChannel)) {
            const errorMessage: string = "Must be a message from a guild text channel!"
            message.reply(errorMessage);
            return;
        }

        const channelId: string = (message.channel as TextChannel).id;
        if (message.content.includes(gameManager.ABORT_COMMAND)) {
            this.abortGame(message)
            return;
        }

        if (this.games.has(channelId)) {
            const errorMessage: string = "Game already running!"
            message.reply(errorMessage);
            return;
        }

       this.newGame(message)
    }

    public isActive(message: any): boolean {

        if (!(this.games.size > 0)) return false;
        if (!message || !(message instanceof Message)) return false;
        if (!message.guild || !message.channel || !(message.channel instanceof TextChannel)) return false;
        if (!this.games.has(message.channelId)) return false;

        return true;
    }

    public abortGame(message: Message): boolean {
        const channel = message.channel;
        const current: game | undefined = this.games.get(channel.id);
        
        if(!current || current.state === wwiState.INITIALIZING) {
            console.warn("Cannot abort game!")
            return false;
        }

        this.games.delete(channel.id);
        console.info("Game aborted: " + channel.id)
        return true;
    }

    public async newGame(message: Message) {

        if (!message || !(message instanceof Message)) throw new Error("Message can't be null!");

        const guild: Guild | null  = message.guild;

        if (!guild) {
            const errorMessage: string = "Only in guild channels allowed!"
            message.reply(errorMessage);
            return;
        }

        const gameMembers: Array<GuildMember> = await this.getGameMembersFromMessage(message, guild);
        const guildChannels: any = await guild.channels.fetch()
        const textGuildChannels: Array<TextChannel> = guildChannels.filter((c: any) => (c ? c.type === ChannelType.GuildText : false))
        const gameChannel: TextChannel = message.channel as TextChannel;

        const config: gameConfig = new gameConfig(gameChannel, textGuildChannels, gameMembers);
        const wwiGame: game = new game(config);

        try {
            await wwiGame.initialize();
            await wwiGame.start();
            this.games.set(wwiGame.id, wwiGame);
        }
        catch(e) {
            console.error("Non recoverable error ocurred, game not initialized", e)
        }       
    }

    public guessForGame(message: any) {
        if (!message || !(message instanceof Message)) throw new Error("Message can't be null!");

        const channelId: string = (message as Message).channelId;

        if (!this.games.has(channelId)) return;

        const currentGame: game = this.games.get(channelId) as game;
        const isCorrect = currentGame.guess(message);

        if (isCorrect) {
            this.games.delete(channelId)
        }
    }

    private async getGameMembersFromMessage(message: Message, guild: Guild): Promise<Array<GuildMember>> {
        const messageContent: string = message.content;

        console.info("Loading members from message:" + message.content)
        
        const gameMembers: Array<GuildMember> = [];
        const guildMembers: Array<GuildMember> = Array.from((await guild.members.fetch()).values());
        const tokens: Array<string> = messageContent.split(" ");
        tokens.shift() // remove command token

        console.info("Slashing tokens: " + tokens);
        
        tokens.forEach(token => {
            const guildMember = guildMembers.find((guildMember: GuildMember) =>
                isSameUserName(guildMember.nickname, token) || isSameUserName(guildMember.user.username, token));
            if (guildMember) {
                gameMembers.push(guildMember);
            } 
            else {
                console.warn("Could not find user for token:" + token)
            }
        });

        return gameMembers;
    }
}

module.exports = new gameManager();
