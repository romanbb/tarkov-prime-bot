import { Readable, Stream } from "stream";

export class ActiveStream {
    internalActiveStreamId: string = new Date().getTime().toString();

    stream: Readable | undefined;
    readyToDelete: boolean = false;
    userId: string;
    speechRecognizingResulted: boolean = false; // Add userDoneSpeaking property
    public constructor(userId: string, stream: Readable) {
        this.userId = userId;
        this.stream = stream;
    }
    closeStream() {
        if (this.stream && !this.stream.destroyed && this.readyToDelete) {
            console.log("closing stream for ", this.userId, "id:", this.internalActiveStreamId);
            this.stream.destroy();
        }
    }
    toString() {
        return `ActiveStream: ${this.userId}, {readyToDelete: ${this.readyToDelete}, userDoneSpeaking: ${this.speechRecognizingResulted}}`;
    }
}
