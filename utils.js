const formatter = new Intl.NumberFormat('Ru-ru', {
    style: 'currency',
    currency: "RUB",
})

function formatRubles(money) {
    return formatter.format(money);
}

module.exports.formatRubles = formatRubles