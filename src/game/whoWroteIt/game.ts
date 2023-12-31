import { TextChannel, Message, userMention, channelMention } from "discord.js";

import { gameConfig } from "./gameConfig";
import { dataProvider } from "./dataProvider";

import utility from "../../utility/utility";


export class game {
    public id: string;
    public config: gameConfig;
    private dataProvider: dataProvider;
    private messages: Array<Message>;
    private answer: Message;
    private isEnded: boolean

    constructor(config: gameConfig) {
        this.id = config.gameChannel.id;
        this.config = config;
        this.dataProvider = new dataProvider(config);
        this.messages = new Array();
        this.answer = {} as Message
        this.isEnded = false;
    }

    public async initialize(): Promise<game> {
        this.gameOutput("Starting game with id: " + this.id);

        const membersPing: string = this.config.members.map(member => {
            return userMention(member.id);
        }).join(" - ");

        await this.gameOutput("Loading game data for members: " + membersPing);
        this.messages = await this.dataProvider.createGameData()
        await this.gameOutput("Created game data with : " + this.messages.length + " messages");
        return this;

    }

    public async start() {
        if (!this.messages || this.messages.length == 0) {
            let errorMessage: string = "Error: Game was not initialized! There were no eligible messages in this channel.";
            await this.gameOutput(errorMessage);
            throw new Error(errorMessage);
        }

        const randomMessage: Message = this.messages[Math.floor(Math.random() * this.messages.length)];
        this.answer = randomMessage;
        await this.gameOutput("Who wrote this message at "
            + randomMessage.createdAt.toDateString()
            + "?\n "
            + randomMessage.content)

    }

    public guess(guessedMember: string): boolean {

        // todo make this better ie. tagging the winner who made the guess
        let correctMemberUsername = this.answer.author.username;
        let correctMemberNickname = this.answer.member?.nickname;
        this.isEnded = utility.isSameUserName(correctMemberUsername, guessedMember) || utility.isSameUserName(correctMemberNickname, guessedMember);

        if(this.isEnded) {
            this.gameOutput(`Correct! ${userMention(this.answer.author.id)} wrote this at ${this.answer.createdAt.toUTCString()} in ${channelMention(this.answer.channelId)}`);
        }

        return this.isEnded; 
    }

    private async gameOutput(message: string) {
        // todo make this with fancy embeds
        let channel: TextChannel = this.config.gameChannel;

        if(!channel) {
            console.log("Channel not initialized!");
            return;
        }

        if(!message) {
            console.log("Message is empty!");
            return;
        }

        console.log(message)
        await channel.send(message);
    }
}

