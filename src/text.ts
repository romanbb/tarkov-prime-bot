import { Embed, EmbedBuilder } from "discord.js";
import { TarkovMarketItemResult } from "./tarkov-market";
import { calculateTax, formatMoney } from "./utils";

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
        .setThumbnail(mainItem.icon);

    const tax = calculateTax(mainItem.basePrice, mainItem.avg24hPrice);
    if (!mainItem.bannedOnFlea) {

        embed.addFields(
            { name: "Average 24h Price", value: formatMoney(mainItem.avg24hPrice), inline: true },
            // { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Tax', value: `${formatMoney(tax)}`, inline: true },
            { name: "Per Slot w/tax", value: formatMoney((mainItem.avg24hPrice - tax) / mainItem.slots), inline: true },
        );
    }

    embed.addFields(
        { name: "Sell to " + mainItem.traderName, value: formatMoney(mainItem.traderPrice, mainItem.traderPriceCur), inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: "Per Slot", value: formatMoney(mainItem.traderPrice / mainItem.slots, mainItem.traderPriceCur), inline: true },
    );

    if (mainItem.bannedOnFlea && mainItem.avg24hPrice - tax < mainItem.traderPriceRub) {
        // sell to trader better deal
        embed.addFields(
            { name: "\u200B" + mainItem.traderName, value: "Selling to trader is a better profit!" },
        )
    }

    if (items[1]) {
        embed.addFields(
            { name: '\u200B', value: 'Other results' },
            { name: items[1].name, value: formatMoney(items[1].avg24hPrice), inline: true }
        );
    }
    if (items[2]) {
        embed.addFields(
            { name: items[2].name, value: formatMoney(items[2].avg24hPrice), inline: true }
        );
    }

    if (items.length > 2) {
        embed.setFooter({ text: `${items.length} results found. Try narrowing your query!` });
    }

    return embed;
}