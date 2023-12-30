import { TextChannel, Message} from "discord.js";

import { gameConfig } from "./gameConfig";
import { dataProvider } from "./dataProvider";

import utiliy from "../../utility/utility";


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
            return "@" + member.user.tag;
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
        let correctMember = this.answer.author.username;
        this.isEnded = utiliy.isSameUserName(correctMember, guessedMember);

        if(this.isEnded) {
            this.gameOutput("Correct! " 
            + correctMember 
            + " wrote this at " 
            + this.answer.createdAt.toUTCString()
            + " in " 
            + "#" 
            + (this.answer.channel as TextChannel).name);

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

