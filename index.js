const Discord = require('discord.js');
const config = require('./config.json');
require('dotenv').config()
const { aqcuireStreamingClient, transcribeStream } = require('./aws');
const { queryItem } = require('./tarkov-market');


/**
 * @type {Discord.TextChannel}
 */
var textChannel;
/**
 * @type {Discord.VoiceChannel}
 */
var voiceChannel;
/**
 * @type {Discord.VoiceConnection}
 */
var voiceChannelConnection;

const cleanup = (options, code) => {
    if (voiceChannelConnection) {
        voiceChannelConnection.disconnect();
        voiceChannelConnection.removeAllListeners();
        voiceChannelConnection = undefined;
    }
    if (options.exit) {
        process.exit();
    }
}

// cleanup bot on exit, disconnect from channel, etc
process.addListener('exit', cleanup.bind(null, {}));
process.addListener('SIGINT', cleanup.bind(null, { exit: true }));
process.addListener('SIGABRT', cleanup.bind(null, { exit: true }));

const client = new Discord.Client();

const activeUsers = {};

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong.');
    } else if (message.content == '!start') {
        if (message.member.voice.channel && !isActiveForUser(message.member.id)) {

            activeUsers[message.member.id] = true;
            listenToUser(message.member.voice.channel, message.member, message.channel);

        } else {
            console.log("Cannot join channel because user is not in one");
        }
    } else if (message.content == '!stop') {
        delete activeUsers[message.member.id];

        if (Object.keys(activeUsers).length == 0) {
            console.log("last user unsubscribed, cleaning up");
            cleanup({ exit: false });
        }
    }
});

function isActiveForUser(userId) {
    return activeUsers[userId];
}

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
    });

/**
 * 
 * @param {Discord.VoiceChannel} voiceChannel 
 * @param {Discord.GuildMember} user
 * @param {Discord.TextChannel} channel
 */
async function listenToUser(incomingVoiceChannel, user, channel) {
    if (!voiceChannel || voiceChannel.id != incomingVoiceChannel.id || !voiceChannelConnection) {
        // console.log("Changing channels", incomingVoiceChannel);
        textChannel = channel;
        voiceChannel = incomingVoiceChannel;
        // change channels? clear users?
        if (voiceChannelConnection) {
            cleanup({exit: false});
        }
        voiceChannelConnection = await voiceChannel.join();
    }

    // only create stream when user starts actually talking
    voiceChannelConnection.on('speaking', (speakerUser, speaking) => {
        // console.log("speaking,", speakerUser.username, speaking);
        if (speaking.bitfield == 1 && user.id == speakerUser.id && isActiveForUser(speakerUser.id)) {
            //console.log("Listening to user", speakerUser.id)
            const audioStream = voiceChannelConnection.receiver.createStream(user, {
                mode: "pcm",
            })

            transcribeStream(undefined, audioStream)
                .then(processTranscript)
                .then(queryItem)
                .then(onItemFound)
                .catch(error => {
                    console.error("Error in transcribe process", error);
                })
        }
    });
}

/**
 * 
 * @param {string} string
 * @returns {string} a keyword if we matched the regex
 */
async function processTranscript(string) {
    var result = undefined;
    if (string) {
        console.log("processing transcript", string);
        const regexCollection = config.key_phrases.flatMap(phrase => `${phrase} ([A-Za-z]*)`)

        regexCollection.forEach((regex) => {
            const match = string.toLowerCase().match(regex);

            if (match && match.length > 0) {
                // console.log("found item", match[1]);
                result = match[1];
            }
        });
    }
    return result;
}

/**
 * @param {string} string the text to output and speak
 */
async function onItemFound(string) {
    if (textChannel && string) {
        console.log("should tts", string);
        textChannel.send(string, { tts: true });
    }
}
