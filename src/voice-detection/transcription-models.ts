export interface ITranscriptionCallback {
    onTranscriptionCompleted: (text: string) => void;
    // public onTranscriptionError?: (error: string) => void;
}
