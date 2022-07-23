import type { VoiceConnection } from '@discordjs/voice';
import { EmbedBuilder, TextBasedChannel, TextChannel } from 'discord.js';
import { synthesizeSpeech } from './aws';
import type { TarkovMarketItemResult } from './tarkov-market';

const formatter = new Intl.NumberFormat('Ru-ru', {
    style: 'currency',
    currency: "RUB",
})

export function formatRubles(money: number) {
    return formatter.format(money);
}


export function kFormatter(num: number) {
    const thousands = ((Math.abs(num) / 1000).toFixed(1))
    return Math.abs(num) > 999 ? Math.sign(num) * +thousands + 'k' : Math.sign(num) * Math.abs(num)
}
