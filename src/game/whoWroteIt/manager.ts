import { Message, ChannelType, TextChannel, GuildMember, Guild } from "discord.js";

import { game } from "./game"
import { gameConfig } from "./gameConfig"

import utility from "../../utility/utility";

class gameManager {

    private games: Map<string, game>

    constructor() {
        this.games = new Map();
    }

    public isActive(message: any): boolean {

        if (!(this.games.size > 0)) return false;
        if (!message || !(message instanceof Message)) return false;
        if (!message.guild || !message.channel || !(message.channel instanceof TextChannel)) return false;
        if (!this.games.has(message.channelId)) return false;

        return true;
    }

    public async newGame(message: any) {

        if (!message || !(message instanceof Message)) throw new Error("Message can't be null!");

        if (!message.guild || !message.channel || !(message.channel instanceof TextChannel)) {
            const errorMessage: string = "Must be a message from a guild text channel!"
            message.reply(errorMessage);
            return;
        }

        const channelId: string = (message.channel as TextChannel).id;
        if (this.games.has(channelId)) {
            const errorMessage: string = "Game already running!"
            message.reply(errorMessage);
            return;
        }

        const guild: Guild | null = message.guild;

        if (!guild) {
            const errorMessage: string = "Only in guild channels allowed!"
            message.reply(errorMessage);
            return;
        }

        const gameMembers: Array<GuildMember> = await this.getGameMembersFromMessageLambda(message, guild);
        const guildChannels: any = await message.guild.channels.fetch()
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
        const isCorrect = currentGame.guess(message.content);

        if (isCorrect) {
            this.games.delete(channelId)
        }
    }

    private async getGameMembersFromMessage(message: Message, guild: Guild): Promise<Array<GuildMember>> {
        let messageContent: string = message.content;

        console.info("Loading members from message:" + message.content)

        const gameMembers: Array<GuildMember> = new Array();
        const guildMembers: Array<GuildMember> = Array.from((await guild.members.fetch()).values());
        const tokens: Array<string> = messageContent.split(" ");
        tokens.shift() // remove command token

        console.info("Slashing tokens: " + tokens);

        let indexMembers = guildMembers.length
        let indexTokens = tokens.length

        console.info("index are: ", indexMembers, indexTokens);

        // Iterate in reserve to not shift the iterating index while splicing
        while (indexMembers--) {
            while (indexTokens--) {
                const selectedToken: string = tokens[indexTokens];
                const guildMember: GuildMember = guildMembers[indexMembers];
                console.info(guildMembers)
                const guildMemberUserName: string = guildMember.user.username;

                console.info("Comparing: " + selectedToken + " with: " + guildMemberUserName);
                if (utility.isSameUserName(selectedToken, guildMemberUserName)) {
                    gameMembers.push(guildMember);

                    // remove each (1) comparing element at the index
                    guildMembers.splice(indexMembers, 1);
                    tokens.splice(indexTokens, 1);
                }
            }
            indexTokens = tokens.length; // reset indexTokens
        } 
        return gameMembers;
    }

    private async getGameMembersFromMessageLambda(message: Message, guild: Guild): Promise<Array<GuildMember>> {
        let messageContent: string = message.content;

        console.info("Loading members from message:" + message.content)
        
        const gameMembers: Array<GuildMember> = [];
        const guildMembers: Array<GuildMember> = Array.from((await guild.members.fetch()).values());
        const tokens: Array<string> = messageContent.split(" ");
        tokens.shift() // remove command token

        console.info("Slashing tokens: " + tokens);
        
        tokens.forEach(token => {
            const guildMember = guildMembers.find((guildMember: GuildMember) => utility.isSameUserName(guildMember.user.username, token));
            if (guildMember) gameMembers.push(guildMember);
        });

        return gameMembers;
    }
}

module.exports = new gameManager();

