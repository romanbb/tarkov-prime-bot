const Discord = require('discord.js');
const config = require('./config.json');
require('dotenv').config()
const { aqcuireStreamingClient, transcribeStream } = require('./aws');
const { queryItemSummary, queryItems } = require('./tarkov-market');
const { formatRubles } = require('./utils');


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
                .then(queryItems)
                .then(onItemsFound)
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
 * @param items
 */
 async function onItemsFound(items) {
    if (textChannel && items && items.length) {
        const mainItem = items[0];
        const embed = new Discord.MessageEmbed()
            .setTitle(mainItem.shortName)
            .setURL(mainItem.wikiLink)
            .setDescription(mainItem.name)
            .setAuthor("Tarkov Prime Flea Lookup", undefined, mainItem.link)
            // .setImage(mainItem.imgBig)
            .setThumbnail(mainItem.icon)
            .addFields(
                { name: "Average 24h Flea Price", value: formatRubles(mainItem.avg24hPrice) },
                { name: "Average 7d Price Flea", value: formatRubles(mainItem.avg7daysPrice) },
            );

        if (items[1]) {
            embed.addField(items[1].name, items[1].avg24hPrice, true)
        }
        if (items[2]) {
            embed.addField(items[2].name, items[2].avg24hPrice, true)
        }
        textChannel.send(embed);
    }
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
