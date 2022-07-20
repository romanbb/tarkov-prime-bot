const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

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
async function listenToUser(voiceChannel, user) {
    const connection = await voiceChannel.join();

    const audio = connection.receiver.createStream(user, {
        mode: "pcm"
    })
    audio.addListener("close", () => {
        console.log("Event :: close")

        // setup a new stream
        listenToUser(voiceChannel, user);
    })

    audio.pipe(fs.createWriteStream(`${user.id}-audio-${new Date().getTime()}.pcm`))
}

