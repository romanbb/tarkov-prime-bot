const AWS = require("aws-sdk");
const { TranscribeStreamingClient } = require("@aws-sdk/client-transcribe-streaming");
const sts = new AWS.STS();

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
    const { Credentials } = await getCredentials()
    const transcribeClient = new TranscribeStreamingClient({
        region: process.env.AWS_DEFAULT_REGION,
        credentials: {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken
        }
    });
    return transcribeClient
}

module.exports.aqcuireStreamingClient = aqcuireStreamingClient
