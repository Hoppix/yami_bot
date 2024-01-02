import { TextChannel, Message, GuildMember } from "discord.js";

import { gameConfig } from "./gameConfig";
import { dataProvider } from "./dataProvider";
import { moderator } from "./moderator";
import { wwiState, wwiStateMachine} from "./state";
import utility from "../../utility/utility";


export class game {
    public id: string;
    public config: gameConfig;
    public state: wwiState
    private dataProvider: dataProvider;
    private messages: Array<Message>;
    private answer: Message;

    constructor(config: gameConfig) {
        this.id = config.gameChannel.id;
        this.config = config;
        this.dataProvider = new dataProvider(config);
        this.messages = new Array();
        this.answer = {} as Message;
        this.state = wwiState.CREATED;
    }

    public async initialize(): Promise<game> {
        if (this.config.members.length < 2) {
            const errorMessage: string = "Error: There were not enough members. Atleast 2.";
            await moderator.sendDefaultGameMessage(errorMessage, this.config.gameChannel);
            throw new Error(errorMessage);
        }

        moderator.sendStartGameMessage(this.id, this.config.gameChannel, this.config.members, this.config.gameChannel);

        await moderator.sendDefaultGameMessage("Loading game data ... (this might take a while)", this.config.gameChannel);
        this.state = wwiStateMachine.initialize(this.state);
        this.messages = await this.dataProvider.createGameData();
        await moderator.sendDefaultGameMessage("Created game data with : " + this.messages.length + " messages", this.config.gameChannel);

        return this;
    }

    public async start() {
        if (!this.messages || this.messages.length == 0) {
            const errorMessage: string = "Error: Game was not initialized! There were no eligible messages in this channel.";
            await moderator.sendDefaultGameMessage(errorMessage, this.config.gameChannel);
            throw new Error(errorMessage);
        }

        const randomMessage: Message = this.messages[Math.floor(Math.random() * this.messages.length)];

        this.answer = randomMessage;
        this.state = wwiStateMachine.start(this.state);
        await moderator.sendDefaultGameMessage("Who wrote this message"
            + "?\n "
            + "'"
            + randomMessage.content
            + "'", 
            this.config.gameChannel);
    }

    public guess(guess: Message): boolean {

        const guessedMember: string  = guess.content;
        const guesser: GuildMember | null = guess.member;
        const guessChannel = guess.channel

        if(!(guessChannel instanceof TextChannel)) {
            console.warn("Illegal state: not in a text channel");
            return this.state === wwiState.ENDED
        }

        if(!guesser) {
            console.warn("Illegal state: guesser does not exist");
            return this.state === wwiState.ENDED
        }

        const correctMemberUsername = this.answer.author.username;
        const correctMemberNickname = this.answer.member?.nickname;
        const correct: boolean = utility.isSameUserName(correctMemberUsername, guessedMember) || utility.isSameUserName(correctMemberNickname, guessedMember);

        if(correct) {
            moderator.sendFinishGameMessage(guesser, this.answer, guessChannel, guessChannel);
            this.state = wwiStateMachine.end(this.state);
        }

        return this.state === wwiState.ENDED
    }
}


