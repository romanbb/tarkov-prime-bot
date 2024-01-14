import { EmbedBuilder } from "discord.js";
import { request, gql } from "graphql-request";
import * as Types from "./tarkov-dev.types";
import { calculateTax, formatMoney, kFormatter } from "../utils";

export async function queryItem(query: string | undefined): Promise<Types.Item[] | null> {
    if (!query) {
        return null;
    }
    const gqlQ = gql`
    {
        items(name: "${query}") {
			id
			name
			changeLast48h
			shortName
			basePrice
			sellFor {
			  vendor {
				name
			  }
			  price
			  currency
			  priceRUB
			}
            width
            height
			wikiLink
            link
            iconLink
			avg24hPrice
        }
    }
    `;

    const result = await request<{ items: Types.Item[] }>("https://api.tarkov.dev/graphql", gqlQ);
    return result.items;
}

function findBestTrader(prices: Types.ItemPrice[]): Types.ItemPrice {
    if (!prices.length) {
        // return undefined;
        throw "Unexpected empty prices";
    }
    let bestPrice: Types.ItemPrice = prices[0]!;

    for (let i = 1; i < prices.length; i++) {
        if (prices[i]?.vendor.name === "Flea Market") {
            continue;
        }
        if (prices[i]!.priceRUB ?? 0 > bestPrice?.priceRUB!) {
            bestPrice = prices[i]!;
        }
    }
    return bestPrice;
}

export function getTtsString(mainItem: Types.Item | null) {
    if (!mainItem) {
        return null;
    }

    const bestTrader = findBestTrader(mainItem.sellFor!);

    let text;
    if (mainItem.avg24hPrice == 0) {
        text = `${mainItem.shortName} sells to ${bestTrader.vendor.name} for ${kFormatter(bestTrader.priceRUB!)}`;
    } else {
        const tax = calculateTax(mainItem.basePrice, mainItem.avg24hPrice ?? 0);
        if (mainItem.avg24hPrice && mainItem.avg24hPrice - tax < bestTrader.priceRUB!) {
            // sell to trader better deal
            text = `${mainItem.shortName} sells to ${bestTrader.vendor.name} for ${kFormatter(bestTrader.priceRUB!)} with tax evasion.`;
        } else {
            text = `${mainItem.shortName} going for ${kFormatter(mainItem.avg24hPrice ?? 0)}.`;
        }
    }

    return text;
}

export function embedForItems(items: Types.Item[] | null): EmbedBuilder | null {
    if (!items || !items.length || !items[0]) {
        return null;
    }
    console.log("embedForItems", items);
    const mainItem = items[0];
    const avg24hPrice = mainItem.avg24hPrice ?? 0;
    const slots = mainItem.width * mainItem.height;
    const bestTrader = findBestTrader(mainItem.sellFor ?? []);
    const bannedOnFlea = avg24hPrice === 0;
    const embed = new EmbedBuilder()
        .setTitle(mainItem.shortName ?? null)
        .setURL(mainItem.wikiLink || mainItem.link)
        .setDescription(mainItem.name ?? null)
        .setAuthor({
            name: "Tarkov Prime Flea Lookup",
            url: mainItem.link || null,
        })
        // .setImage(mainItem.imgBig)
        .setThumbnail(mainItem.iconLink ?? null);

    const tax = calculateTax(mainItem.basePrice, avg24hPrice);
    if (mainItem.avg24hPrice ?? 0 > 0) {
        embed.addFields(
            { name: "Average 24h Price", value: formatMoney(avg24hPrice), inline: true },
            // { name: '\u200B', value: '\u200B', inline: true },
            { name: "Tax", value: `${formatMoney(tax)}`, inline: true },
            {
                name: "Per Slot w/tax",
                value: formatMoney((avg24hPrice - tax) / slots),
                inline: true,
            },
        );
    }

    embed.addFields(
        {
            name: "Sell to " + bestTrader.vendor.name,
            value: formatMoney(bestTrader.price!, bestTrader?.currency!),
            inline: true,
        },
        { name: "\u200B", value: "\u200B", inline: true },
        {
            name: "Per Slot",
            value: formatMoney(bestTrader.price! / slots, bestTrader.currency!),
            inline: true,
        },
    );

    if (!bannedOnFlea && avg24hPrice - tax < bestTrader.priceRUB!) {
        // sell to trader better deal
        embed.addFields({
            name: "\u200B" + bestTrader.vendor.name,
            value: "Selling to trader is a better profit!",
        });
    }

    if (items[1]) {
        embed.addFields(
            { name: "\u200B", value: "Other results" },
            { name: items[1].name!, value: formatMoney(items[1].avg24hPrice ?? 0), inline: true },
        );
    }
    if (items[2]) {
        embed.addFields({
            name: items[2].name!,
            value: formatMoney(items[2].avg24hPrice ?? 0),
            inline: true,
        });
    }

    if (items.length > 2) {
        embed.setFooter({ text: `${items.length} results found. Try narrowing your query!` });
    }

    return embed;
}
