import { config as setupDotEnv } from 'dotenv'
setupDotEnv();

export default {
    aws: {
        accessKey: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
        defaultRegion: process.env.AWS_DEFAULT_REGION ?? ""
    },
    discord: {
        token: process.env.DISCORD_TOKEN ?? "",
        dev_guild_id: process.env.DISCORD_DEV_GUILD_ID,
        dev_force_input_channel: process.env.DISCORD_DEV_OUTPUT_CHANNEL,
        dev_user_to_auto_listen: process.env.DISCORD_DEV_USER_AUTO_LISTEN
    },
    tarkov_market: {
        token: process.env.TARKOV_MARKET_TOKEN ?? ""
    },
    debug: process.env.NODE_ENV !== "production"


}