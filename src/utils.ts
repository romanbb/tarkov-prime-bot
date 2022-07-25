const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
})

export function formatMoney(money: number, currency: string = "₽") {
    if (currency === "$") {
        return `${currency} ${formatter.format(money)}`;
    }
    return `${formatter.format(money)} ${currency}`;
}

export function kFormatter(num: number) {
    const thousands = ((Math.abs(num) / 1000).toFixed(1))
    return Math.abs(num) > 999 ? Math.sign(num) * +thousands + 'k' : Math.sign(num) * Math.abs(num)
}
