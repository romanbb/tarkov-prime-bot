import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { calculateTax, formatMoney, kFormatter } from "src/utils";
import Environment from '../config.env';

export interface TarkovMarketItemResult {
    avg24hPrice: number;
    avg7daysPrice: number;
    bannedOnFlea: boolean;
    basePrice: number;
    bsgId: string;
    diff27h: number;
    diff7days: number;
    haveMarketData: boolean;
    icon: string;
    img: string;
    imgBig: string;
    isFunctional: boolean;
    link: string;
    name: string;
    price: number;
    reference: string;
    shortName: string;
    slots: number;
    tags: string[];
    traderName: string;
    traderPrice: number;
    traderPriceCur: string;
    traderPriceRub: number;
    uid: string;
    updated: string;
    wikiLink: string;
}

const axiosClient =  axios.create({
    baseURL: 'https://tarkov-market.com/api/v1/',
    timeout: 5000,
    headers:  {
        'x-api-key': Environment.flea.tarkov_market.token
    }
  });

export async function queryItemSummary(item?: string): Promise<string | null> {
    if (item) {
        console.log("found item to lookup", item);;
        const url = `item?q=${item}`;

        const response = await axiosClient.get<TarkovMarketItemResult[]>(url);

        const json = response.data;

        var output = "";

        // console.log("json", json)
        json.forEach((item: TarkovMarketItemResult) => {
            output += item.shortName + " last day average: " + item.avg24hPrice + "\n"
        })


        return output
    }
    return null;
}


export async function queryItems(item?: string): Promise<TarkovMarketItemResult[] | null> {
    if (item) {
        console.log("✅ Found item to lookup: ", item);;
        const url = `https://tarkov-market.com/api/v1/item?q=${item}`;
        const response = await axiosClient.get<TarkovMarketItemResult[]>(url);

        return response.data;
    }
    return null;
}

export function getTtsString(mainItem: TarkovMarketItemResult | null) {
    if (!mainItem) {
        return null
    }
    let text;
    if (mainItem.bannedOnFlea) {
        text = `${mainItem.shortName} sells to ${mainItem.traderName} for ${kFormatter(mainItem.traderPrice)}`;
    } else {

        const tax = calculateTax(mainItem.basePrice, mainItem.avg24hPrice);
        if (mainItem.avg24hPrice - tax < mainItem.traderPriceRub) {
            // sell to trader better deal
            text = `${mainItem.shortName} sells to ${mainItem.traderName} for ${kFormatter(mainItem.traderPrice)} with tax evasion.`;
        } else {
            text = `${mainItem.shortName} going for ${kFormatter(mainItem.avg24hPrice)}.`;
        }
    }
    return text
}

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

    if (!mainItem.bannedOnFlea && mainItem.avg24hPrice - tax < mainItem.traderPriceRub) {
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