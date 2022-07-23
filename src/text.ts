import { Embed, EmbedBuilder } from "discord.js";
import { TarkovMarketItemResult } from "./tarkov-market";
import { formatRubles } from "./utils";

export function embedForItems(items: TarkovMarketItemResult[] | null): EmbedBuilder | null {
    if (!items || !items.length || !items[0]) {
        return null;
    }
    const mainItem = items[0];
    const embed = new EmbedBuilder()
        .setTitle(mainItem.shortName)
        .setURL(mainItem.wikiLink)
        .setDescription(mainItem.name)
        .setAuthor({ name: "Tarkov Prime Flea Lookup", url: mainItem.link })
        // .setImage(mainItem.imgBig)
        .setThumbnail(mainItem.icon)
        .addFields(
            { name: "Average 24h Flea Price", value: formatRubles(mainItem.avg24hPrice) },
            { name: "Average 7d Price Flea", value: formatRubles(mainItem.avg7daysPrice) },
            { name: "Sell to " + mainItem.traderName, value: formatRubles(mainItem.traderPrice) }
        );

    if (items[1]) {
        embed.addFields(
            { name: '\u200B', value: 'Other results' },
            { name: items[1].name, value: formatRubles(items[1].avg24hPrice), inline: true }
        );
    }
    if (items[2]) {
        embed.addFields(
            { name: items[2].name, value: formatRubles(items[2].avg24hPrice), inline: true }
        );
    }

    if (items.length > 2) {
        embed.setFooter({ text: `${items.length} results found. Try narrowing your query!` });
    }

    return embed;
}