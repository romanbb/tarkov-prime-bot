const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

/**
 * @type Discord.VoiceChannel
 */
var voiceChannel;
/**
 * @type Discord.VoiceConnection
 */
var voiceChannelConnection;

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



client.login(config.token);



/**
 * 
 * @param {Discord.VoiceChannel} voiceChannel 
 * @param {Discord.GuildMember} user
 */
async function listenToUser(incomingVoiceChannel, user) {
    if (!voiceChannel || voiceChannel.id != incomingVoiceChannel.id) {
        console.log("Changing channels", incomingVoiceChannel);

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

        // setup a new stream
        listenToUser(voiceChannel, user);
    })

    audio.pipe(fs.createWriteStream(`${user.id}-audio-${new Date().getTime()}.pcm`))
}

