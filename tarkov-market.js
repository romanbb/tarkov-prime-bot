const config = require('./config.json');

async function queryItem(item) {
    console.log("found item to lookup", item);;
    if (item) {
        const url = `https://tarkov-market.com/api/v1/item?q=${item}`;
        const response = await fetch(url, {headers: {
            'x-api-key': config['tarkov-market'].api_key
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

// queryItem("grizzly").then(result => console.log(result))

module.exports.queryItem = queryItem