const Discord = require('discord.js');
const { onItemsFound } = require("../utils.js")
const { queryItems } = require('../tarkov-market.js')

module.exports = {
    name: "check",
    description: "Check price",
    /**
     * @param {Discord.Message} message 
     * @param {Array<String>} args 
     */
    execute(message, args) {
        args.forEach(arg => {
            queryItems(arg)
                .then(items => onItemsFound(message.channel, items))
        });

    },
}