const Discord = require('discord.js');

const formatter = new Intl.NumberFormat('Ru-ru', {
    style: 'currency',
    currency: "RUB",
})

function formatRubles(money) {
    return formatter.format(money);
}

/**
 * @param {Discord.TextChannel} textChannel
 * @param {Array} items
 */
const onItemsFound = async (textChannel, items) => {
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
}

module.exports.onItemsFound = onItemsFound