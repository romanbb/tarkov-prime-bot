# Tarkov Prime Bot

This is a Discord bot that allows you to lookup flea market prices with your voice.

## How it works

The bot listens and transcribes all text spoken by any user who starts the bot command. Then that transcribed text is processed in the bot and matched against some pattern, like `price check <item>`. Then `<item>` is looked up on Tarkov-Market and the bot spits out some useful information from there. Along with a shorter TTS message played in the channel.

## Run it yourself

### Requirements
1. Basic knowledge of Node/Javscript/AWS
2. AWS Account (this will cost based on usage)

   1. Amazon Transcribe
   2. Amazon Polly - TTS
   3. S3: for storing/loading vocab model for Transcribe

3. [Tarkov-Market](https://tarkov-market.com) API Key ($5/mo)

### Deploy
I am trying [fly.io](https://fly.io) to host this right now. You can deploy with:

      npm run deploy


### Credentials
All secrets will be stored in `.env`. file.
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=

DISCORD_TOKEN=
TARKOV_MARKET_TOKEN=
```

## TODO
- Rewrite in TypeScript
- Update to discord.js v14
- Multiple server support?