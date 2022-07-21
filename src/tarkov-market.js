async function queryItemSummary(item) {
    if (item) {
        console.log("found item to lookup", item);;
        const url = `https://tarkov-market.com/api/v1/item?q=${item}`;
        const response = await fetch(url, {headers: {
            'x-api-key': process.env.TARKOV_MARKET_TOKEN
        }});

        const json = await response.json();

        var output = "";

        // console.log("json", json)
        json.forEach(item => {
            output += item.shortName  + " last day average: " + item.avg24hPrice + "\n"
        })


        return output
    }
    return undefined;
}


async function queryItems(item) {
    if (item) {
        console.log("found item to lookup", item);;
        const url = `https://tarkov-market.com/api/v1/item?q=${item}`;
        const response = await fetch(url, {headers: {
            'x-api-key': process.env.TARKOV_MARKET_TOKEN
        }});

        return await response.json();
    }
    return undefined;
}

module.exports.queryItemSummary = queryItemSummary
module.exports.queryItems = queryItems