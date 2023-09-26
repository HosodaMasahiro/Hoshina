const express = require('express');
const axios = require('axios');
const { middleware, Client } = require('@line/bot-sdk');

const LINE_CONFIG = {
    channelAccessToken: 'ZB8Gpe2GAEbONqv8+OFeOtAXLCsn5VvOD7W5FQC/o8BcacWIGwR7LvLwBnqhOo5LXR04dSUotMDTXiGOZgayJcDyYBqzXSPcqySbgT6wqp2J6P/3NoL3ehZWXZxS+DZ+5zNnaL+rZsPRfilBBI53ywdB04t89/1O/w1cDnyilFU=', // LINE BotのChannel Access Tokenを指定
    channelSecret: '3ecc1ec6eb77ee7e95d39e7d408bc326' // LINE BotのChannel Secretを指定
};

const app = express();

app.post('/webhook', middleware(LINE_CONFIG), async (req, res) => {
    const lineClient = new Client(LINE_CONFIG);
    const events = req.body.events;

    try {
        for (let event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;

                // OpenAIのAPIを使って返答を生成
                const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
                    prompt: userMessage,
                    max_tokens: 150
                }, {
                    headers: {
                        'Authorization': `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`, // OpenAIのAPIキーを指定
                        'Content-Type': 'application/json'
                    }
                });

                const replyMessage = response.data.choices[0].text.trim();

                // LINEに返答を送る
                await lineClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: replyMessage
                });
            }
        }

        res.status(200).end();
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).end();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
