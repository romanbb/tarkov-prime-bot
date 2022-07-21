const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
require('dotenv').config()
const { aqcuireStreamingClient, transcribeStream } = require('./aws');
const { queryItems } = require('./tarkov-market');
const { onItemsFound } = require('./utils');


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

client.on('error', error => {
    console.error(error);
});

/**
 * Dynamically register commands/
 */
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

/**
 * Command handlers
 */
client.on('message', message => {
    const prefix = "!"
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // TODO migrate these
    if (command == 'start') {
        if (message.member.voice.channel && !isActiveForUser(message.member.id)) {

            activeUsers[message.member.id] = true;
            listenToUser(message.member.voice.channel, message.member, message.channel);

        } else {
            console.log("Cannot join channel because user is not in one");
        }
    } else if (command == 'stop') {
        delete activeUsers[message.member.id];

        if (Object.keys(activeUsers).length == 0) {
            console.log("last user unsubscribed, cleaning up");
            cleanup({ exit: false });
        }
    }

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

function isActiveForUser(userId) {
    return activeUsers[userId];
}

aqcuireStreamingClient()
    .then((transcriber) => {
        transcribeClient = transcriber;
        client.login(process.env.DISCORD_TOKEN);

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
            cleanup({ exit: false });
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
                .then(queryItems)
                .then(items => onItemsFound(textChannel, items, voiceChannelConnection))
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
        const regexCollection = config.key_phrases.flatMap(phrase => `${phrase}`)

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
        textChannel.send(string, { tts: false });
    }
}