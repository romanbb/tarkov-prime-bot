const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
})

export function formatMoney(money: number, currency: string = "₽") {
    if (currency === "$") {
        return `${currency} ${formatter.format(money)}`;
    }
    return `${formatter.format(roundUp(money, 0))} ${currency}`;
}

export function kFormatter(num: number) {
    const thousands = ((Math.abs(num) / 1000).toFixed(1))
    return Math.abs(num) > 999 ? Math.sign(num) * +thousands + 'k' : Math.sign(num) * Math.abs(num)
}

/**
 * @param num The number to round
 * @param precision The number of decimal places to preserve
 */
export function roundUp(num: number, precision: number) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

/**
 * https://escapefromtarkov.fandom.com/wiki/Trading
 * @param basePrice 
 * @param sellPrice 
 * @returns the tax
 */
export function calculateTax(basePrice: number, sellPrice: number) {
    const Q = 1;
    const VO = basePrice * Q;
    const VR = sellPrice * Q;

    let PO = Math.log10(VO / VR);
    if (VR < VO) {
        PO = Math.pow(PO, 1.08);
    }

    let PR = Math.log10(VR / VO);
    if (VR >= VO) {
        PR = Math.pow(PR, 1.08);
    }

    const Ti = 0.05;
    const Tr = 0.1;

    return roundUp((VO * Ti * Math.pow(4, PO) * Q) + (VR * Tr * Math.pow(4, PR) * Q), 0);
}