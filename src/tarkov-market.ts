import axios, { Axios } from "axios";
import Environment from './config.env'

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
    timeout: 1000,
    headers:  {
        'x-api-key': Environment.tarkov_market.token
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
