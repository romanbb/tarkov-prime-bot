const Discord = require('discord.js');
const { synthesizeSpeech } = require('./aws');

const formatter = new Intl.NumberFormat('Ru-ru', {
    style: 'currency',
    currency: "RUB",
})

function formatRubles(money) {
    return formatter.format(money);
}

/**
 * @param {Discord.TextChannel} textChannel for sending to text
 * @param {Array} items required for either scenario
 * @param {Discord.VoiceConnection} voiceConnection for tts
 */
const onItemsFound = async (textChannel, items, voiceConnection) => {
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
                { name: "Sell to " + mainItem.traderName, value: formatRubles(mainItem.traderPrice) },
            );

        if (items[1]) {
            embed.addFields(
                { name: '\u200B', value: 'Other results' },
            )
            embed.addField(items[1].name, formatRubles(items[1].avg24hPrice), true)
        }
        if (items[2]) {
            embed.addField(items[2].name, formatRubles(items[2].avg24hPrice), true)
        }

        if (items.length > 2) {
            embed.setFooter(`${items.length} results found. Try narrowing your query!`)
        }
        textChannel.send(embed);
    }
    if (voiceConnection && items && items.length) {
        const mainItem = items[0];

        let text;
        if (mainItem.bannedOnFlea) {
            text = `${mainItem.shortName} sells to ${mainItem.traderName} for ${kFormatter(mainItem.traderPrice)}`;
        } else {
            text = `${mainItem.shortName} going for ${kFormatter(mainItem.avg24hPrice)}`
        }

        const stream = await synthesizeSpeech(text);

        voiceConnection.play(stream, {
            bitrate: 48000
        })
    }
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}

module.exports.onItemsFound = onItemsFound