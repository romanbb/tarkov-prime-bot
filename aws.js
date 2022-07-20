const AWS = require("aws-sdk");
const { PassThrough } = require("stream");
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
const sts = new AWS.STS();


/**
 * @type {TranscribeStreamingClient}
 */
var transcribeClient;

/**
 * 
 * @param {string} accessKeyId 
 * @param {string} secretAccessKey 
 * @returns {AWS.STS.Types.GetSessionTokenResponse}
 */
const getCredentials = async () => {
    /**
     * @type AWS.STS.Types.GetSessionTokenRequest
     */
    const params = {
        DurationSeconds: 12 * 60 * 60, // 12 hours,
    };

    /**
     * @type AWS.STS.Types.GetSessionTokenRequest
     */
    var result;

    try {
        result = await sts.getSessionToken(params).promise()
    } catch (err) {
        console.log("error getting session token", err)
    }

    return result;
}

/**
 * @returns {TranscribeStreamingClient}
 */
const aqcuireStreamingClient = async () => {
    if (transcribeClient) {
        return transcribeClient;
    }

    const { Credentials } = await getCredentials()
    transcribeClient = new TranscribeStreamingClient({
        region: process.env.AWS_DEFAULT_REGION,
        credentials: {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken
        }
    });
    return transcribeClient
}


/**
 * @param {string} filename file to transcribe
 * @param {Stream} filename file to transcribe
 * @returns {string} the transcription
 */
async function transcribeStream(filename, stream) {
    const audioPayloadStream = new PassThrough({ highWaterMark: 1 * 1024 }); // Stream chunk less than 1 KB

    if (filename) {
        const audioSource = fs.createReadStream(filename);
        audioSource.pipe(audioPayloadStream);
    } else if (stream) {
        stream.pipe(audioPayloadStream);
    } else {
        throw "file or stream required to transcribe";
    }

    const audioStream = async function* () {
        for await (const payloadChunk of audioPayloadStream) {
            yield { AudioEvent: { AudioChunk: payloadChunk } };
        }
    };

    const command = new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaEncoding: "pcm",
        MediaSampleRateHertz: 48000,
        NumberOfChannels: 2,
        EnableChannelIdentification: true,
        VocabularyName: "tarkov",
        AudioStream: audioStream(),
    });
    const response = await (await aqcuireStreamingClient()).send(command);

    for await (const event of response.TranscriptResultStream) {
        if (event.TranscriptEvent) {
            const results = event.TranscriptEvent.Transcript.Results;
            // right now we filter out partials
            // the downside is that it takes a while for the text processing to give the final result
            const parsedResults = results
                .filter(result => result.IsPartial == false)
                .flatMap(result => result.Alternatives);

            if (parsedResults && parsedResults.length) {
                // console.log("returning transcript, stream:", stream);
                return parsedResults[0].Transcript;
            }

            // parsedResults.forEach(item => console.log("got item", item.Transcript));

        }
    }
    return undefined;
}


module.exports.aqcuireStreamingClient = aqcuireStreamingClient
module.exports.transcribeStream = transcribeStream
