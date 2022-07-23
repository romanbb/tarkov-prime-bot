import AWS from "aws-sdk";
import { PassThrough } from "stream";
import { TranscribeStreamingClient, StartStreamTranscriptionCommand, MediaEncoding } from "@aws-sdk/client-transcribe-streaming";
import { OutputFormat, PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import Environment from './config.env'
import fs from 'fs';
import type Stream from 'stream'

const sts = new AWS.STS();

let transcribeClient: TranscribeStreamingClient;
let pollyClient: PollyClient;
let credentials: AWS.STS.Types.GetSessionTokenResponse | undefined;

const getCredentials = async (): Promise<AWS.STS.GetSessionTokenResponse> => {
    if (credentials) {
        const expiry = credentials.Credentials?.Expiration.getTime();
        if (expiry && expiry > new Date().getTime()) {
            console.log("AWS token expired, renewing")
            credentials = undefined;
        } else {
            return credentials;
        }
    }
    const params: AWS.STS.Types.GetSessionTokenRequest = {
        // DurationSeconds: 12 * 60 * 60, // 12 hours,
        DurationSeconds: 900, // 15m
    };

    try {
        credentials = await sts.getSessionToken(params).promise()
    } catch (err) {
        console.log("error getting session token", err)
        throw err;
    }

    return credentials;
}

const aqcuirePollyClient = async (): Promise<PollyClient> => {
    if (pollyClient) {
        return pollyClient;
    }
    const { Credentials } = await getCredentials();
    if (Credentials) {
        pollyClient = new PollyClient({
            region: Environment.aws.defaultRegion,
            credentials: {
                accessKeyId: Credentials.AccessKeyId,
                secretAccessKey: Credentials.SecretAccessKey,
                sessionToken: Credentials.SessionToken
            }
        });
    } else {
        throw Error("Unable to setup polly client");
    }

    return pollyClient;
}

const aqcuireStreamingClient = async (): Promise<TranscribeStreamingClient> => {
    if (transcribeClient) {
        return transcribeClient;
    }

    const { Credentials } = await getCredentials();
    if (Credentials) {
        transcribeClient = new TranscribeStreamingClient({
            region: Environment.aws.defaultRegion,
            credentials: {
                accessKeyId: Credentials.AccessKeyId,
                secretAccessKey: Credentials.SecretAccessKey,
                sessionToken: Credentials.SessionToken
            }
        });
    } else {
        throw Error("Unable to setup streaming client");
    }

    return transcribeClient
}

export async function synthesizeSpeech(text: string): Promise<Stream.Readable> {
    await aqcuirePollyClient();
    const response = await pollyClient.send(new SynthesizeSpeechCommand({
        Text: text,
        Engine: "standard",
        LanguageCode: "en-US",
        OutputFormat: OutputFormat.MP3,
        VoiceId: "Justin"
    }));

    return response.AudioStream;
}

export async function transcribeStream(filename: string | undefined, stream: Stream.Readable): Promise<string | undefined> {
    const audioPayloadStream = new PassThrough({ highWaterMark: 1 * 1024 }); // Stream chunk less than 1 KB

    if (filename) {
        const audioSource = fs.createReadStream(filename);
        audioSource.pipe(audioPayloadStream);
    } else if (stream) {
        stream.pipe(audioPayloadStream);
    } else {
        throw "file or stream required to transcribe";
    }

    const audioStream = async function* () {
        for await (const payloadChunk of audioPayloadStream) {
            yield { AudioEvent: { AudioChunk: payloadChunk } };
        }
    };

    const command = new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaEncoding: MediaEncoding.OGG_OPUS,
        MediaSampleRateHertz: 48000,
        NumberOfChannels: 2,
        EnableChannelIdentification: true,
        VocabularyName: "tarkov",
        AudioStream: audioStream(),
    });
    const response = await (await aqcuireStreamingClient()).send(command);
    if (response.TranscriptResultStream) {
        for await (const event of response.TranscriptResultStream) {
            if (event.TranscriptEvent?.Transcript?.Results) {
                const results = event.TranscriptEvent.Transcript.Results;
                // right now we filter out partials
                // the downside is that it takes a while for the text processing to give the final result
                const parsedResults = results
                    .filter(result => result.IsPartial == false)
                    .flatMap(result => result.Alternatives);

                if (parsedResults && parsedResults[0]) {
                    // console.log("returning transcript, stream:", stream);
                    return parsedResults[0].Transcript;
                }

                // parsedResults.forEach(item => console.log("got item", item.Transcript));

            }
        }
    }
    return undefined;
}
