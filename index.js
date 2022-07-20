const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { PassThrough } = require("stream");
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
require('dotenv').config()
const { aqcuireStreamingClient } = require('./aws');

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

const cleanup = (options) => {
    if (voiceChannelConnection) {
        voiceChannelConnection.disconnect();
    }
    if (options.exit) {
        process.exit();
    }
}

process.addListener('exit', cleanup.bind(null, {}));
process.addListener('SIGINT', cleanup.bind(null, { exit: true }));

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong.');
    } else if (message.content == '!start') {
        listenToUser(message.member.voice.channel, message.member);
    }
});

aqcuireStreamingClient()
    .then((transcriber) => {
        transcribeClient = transcriber;
        client.login(config.discord.token);
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

    const audio = voiceChannelConnection.receiver.createStream(user, {
        mode: "pcm"
    })
    audio.addListener("close", () => {
        console.log("Event :: close")

        transcribeStream(latestUserRecording[user.id])

        // setup a new stream
        listenToUser(voiceChannel, user);
    })

    const filename = `recordings/${user.id}-audio-${new Date().getTime()}.pcm`;

    latestUserRecording[user.id] = filename

    audio.pipe(fs.createWriteStream(filename))

}

async function transcribeStream(filename) {
    console.log("transcribe stream ", filename)

    const audioSource = fs.createReadStream(filename);
    const audioPayloadStream = new PassThrough({ highWaterMark: 1 * 1024 }); // Stream chunk less than 1 KB
    audioSource.pipe(audioPayloadStream);
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
            const message = event.TranscriptEvent;

            // Get multiple possible results
            const results = event.TranscriptEvent.Transcript.Results;

            // Print all the possible transcripts
            results.map((result) => {

                (result.Alternatives || []).map((alternative) => {
                    const transcript = alternative.Items.map((item) => item.Content).join(" ");
                    console.log("alternative:", transcript);
                });
            });
        }
    }
}

