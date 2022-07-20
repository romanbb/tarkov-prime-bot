const config = require('./config.json');

async function queryItem(item) {
    if (item) {
        //console.log("found item to lookup", item);;
        const url = `https://tarkov-market.com/api/v1/item?q=${item}`;
        const response = await fetch(url, {headers: {
            'x-api-key': config['tarkov_market'].api_key
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

module.exports.queryItem = queryItem