const express = require('express');
const cors = require('cors');
const { default: axios } = require('axios');
require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', function (req, res) {
    res.json({
        message: "API is working"
    })
})

app.post('/api/chat', async function (req, res) {
    try {
        // userMessage will contain what the user will send to the AI
        const userMessage = req.body.userMessage;

        // generate the response
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: process.env.OPENROUTER_MODEL_NAME,
            // response: {
            //     type:"json_object"
            // },
            // context
            messages: [
                {
                    "role": "system",
                    "content": "You're a helpful assistant."
                },
                {
                    "role": "user",
                    "content": userMessage
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        console.log(response.data);
        res.json({
            content: response.data
        })

    } catch (error) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
        console.error('Config URL:', error.config?.url);
        console.error('Model being used:', process.env.OPENROUTER_MODEL_NAME);
        res.status(500).json({
            error: "Unable to generate AI response"
        })
    }
})

app.post('/api/gemini/chat', async function(req,res){
    try {
        let userMessage = req.body.userMessage;

        const prompt = `You are a helpful assistant. User: ${userMessage}`;
        const aiResponse = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });

        console.log(aiResponse);
        res.json({
            response: aiResponse.candidates[0].content.parts[0].text
        })

    } catch (e) {
        console.error(e);
        res.status(500).json({
            'error': "An error has occured"
        })
    }
})

app.listen(3000, function () {
    console.log("Server has started")
})