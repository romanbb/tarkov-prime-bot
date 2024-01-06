import { Readable, Stream } from "stream";

export class ActiveStream {
    stream: Readable | undefined;
    readyToDelete: boolean = false;
    userId: string;
    speechRecognizingResulted: boolean = false; // Add userDoneSpeaking property
    public constructor(userId: string, stream: Readable) {
        this.userId = userId;
        this.stream = stream;
    }
    toString() {
        return `ActiveStream: ${this.userId}, {readyToDelete: ${this.readyToDelete}, userDoneSpeaking: ${this.speechRecognizingResulted}}`;
    }
}
