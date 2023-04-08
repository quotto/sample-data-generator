const { Configuration, OpenAIApi } = require("openai");
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const bucketName = process.env.BUCKET_NAME;
const signedUrlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);

const formatRequirements = {
    csv: "Please enclose each column in double quotes.",
    json: "Please output the data items as objects within an array as [{},{}].",
    xml: "Please output XML tags with in <item></item> in <items></items>.",
}


const createTestData = async (params) => {
    const instructions = `Please generate ${params.outputCount} test data items according to the following requirements.\n\n
Output format: ${params.outputFormat}
Data items:
${params.dataItems
            .map((item, index) => {
                let itemDescription = `   Description: ${item.description}\n`;
                let itemSample = `   Sample: ${item.sample}\n`;

                if (!item.description) {
                    itemDescription = '';
                }
                if (!item.sample) {
                    itemSample = '';
                }

                return (
                    `${index + 1}. Item name: ${item.name}\n   Data type: ${item.type}\n   Maximum byte length: ${item.maxLength}\n   Unique: ${item.unique ? 'Yes' : 'No'
                    }\n   Variable byte length: ${item.variableLength ? 'Yes' : 'No'}\n` + itemDescription + itemSample
                );
            })
            .join('\n')}
${formatRequirements[params.outputFormat]}\n
For the column names, keys or attribute name in the output data, please convert them to appropriate English names. \n
Please output only the test data, without any additional words.`;
    console.log(instructions);
    const prompt = [
        { role: 'system', content: 'You are an AI language model that generate test data.' },
        { role: 'user', content: instructions },
    ];

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: prompt,
        max_tokens: 1000,
        n: 1,
        stop: null,
        temperature: 0.0,
    });

    try {
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating test data:', error);
        throw error;
    }
};

const uploadToS3 = async (key, data) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: data,
    };

    try {
        await s3.upload(params).promise();
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};

const generateSignedUrl = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: signedUrlExpiration,
    };

    try {
        const signedUrl = await s3.getSignedUrlPromise('getObject', params);
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};

exports.handler = async (event) => {
    if(event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200
        }
    }
    try {
        const params = JSON.parse(event.body);
        const testData = await createTestData(params);
        const fileKey = `test-data/${Date.now()}.${params.outputFormat}`;
        await uploadToS3(fileKey, testData);
        const signedUrl = await generateSignedUrl(fileKey);

        return {
            statusCode: 200,
            body: JSON.stringify({ url: signedUrl }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred while generating test data.' }),
        };
    }
};
