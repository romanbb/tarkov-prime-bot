const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { PassThrough } = require("stream");
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
require('dotenv').config()
const { aqcuireStreamingClient } = require('./aws');
const { resolve } = require('path');

/**
 * @type {Discord.VoiceChannel}
 */
var voiceChannel;
/**
 * @type {Discord.VoiceConnection}
 */
var voiceChannelConnection;

/**
 * @type {TranscribeStreamingClient}
 */
var transcribeClient;

const cleanup = (options, code) => {
    if (voiceChannelConnection) {
        voiceChannelConnection.disconnect();
    }
    if (options.exit) {
        process.exit();
    }
}

process.addListener('exit', cleanup.bind(null, {}));
process.addListener('SIGINT', cleanup.bind(null, { exit: true }));
process.addListener('SIGABRT', cleanup.bind(null, { exit: true }));

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});


client.on('message', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong.');
    } else if (message.content == '!start') {
        if (message.member.voice.channel) {
            listenToUser(message.member.voice.channel, message.member);
        } else {
            console.log("Cannot join channel because user is not in one");
        }

    }
});

aqcuireStreamingClient()
    .then((transcriber) => {
        transcribeClient = transcriber;
        client.login(config.discord.token);

        // console.time("transcribe");
        // transcribeStream("recordings/121017601500512256-audio-1658342559010.pcm")
        //     .then(text => {
        //         console.log("Text: ", text)
        //         console.timeEnd("transcribe");
        //     });
    })

const latestUserRecording = {}

/**
 * 
 * @param {Discord.VoiceChannel} voiceChannel 
 * @param {Discord.GuildMember} user
 */
async function listenToUser(incomingVoiceChannel, user) {
    if (!voiceChannel || voiceChannel.id != incomingVoiceChannel.id) {
        // console.log("Changing channels", incomingVoiceChannel);

        voiceChannel = incomingVoiceChannel;
        // change channels? clear users?
        if (voiceChannelConnection) {
            voiceChannelConnection.disconnect();
        }
        voiceChannelConnection = await voiceChannel.join();
    }

    // only create stream when user starts actually talking
    voiceChannelConnection.on('speaking', (speakerUser, speaking) => {
        console.log("speaking,", speakerUser.username, speaking);
        if (speaking.bitfield == 1 && user.id == speakerUser.id) {
            console.log("Listening to user", speakerUser.id)
            const audioStream = voiceChannelConnection.receiver.createStream(user, {
                mode: "pcm",
            })

            transcribeStream(undefined, audioStream)
                .then((transcription) => {
                    console.log("got transcription: ", transcription);
                })
        }
    });

}

/**
 * @param {string} filename file to transcribe
 * @param {Stream} filename file to transcribe
 * @returns {string} the transcription
 */
async function transcribeStream(filename, stream) {
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
        MediaEncoding: "pcm",
        MediaSampleRateHertz: 48000,
        NumberOfChannels: 2,
        EnableChannelIdentification: true,
        VocabularyName: "tarkov",
        AudioStream: audioStream(),
    });
    const response = await transcribeClient.send(command);

    for await (const event of response.TranscriptResultStream) {
        if (event.TranscriptEvent) {
            const results = event.TranscriptEvent.Transcript.Results;
            // right now we filter out partials
            // the downside is that it takes a while for the text processing to give the final result
            const parsedResults = results
                .filter(result => result.IsPartial == false)
                .flatMap(result => result.Alternatives);

            if (parsedResults && parsedResults.length) {
                // console.log("returning transcript, stream:", stream);
                return parsedResults[0].Transcript;
            }

            // parsedResults.forEach(item => console.log("got item", item.Transcript));

        }
    }
    return undefined;
}


