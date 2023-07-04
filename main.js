const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { body, validationResult } = require('express-validator');
const express = require('express')
const cors = require('cors')
const basicAuth = require('express-basic-auth')

const app = express()
const port = 3000
app.use(express.json());
app.use(cors())
// app.use(basicAuth({
//     users: { 'bt66': 'bt66' }
// }))

const client = new Client({
    puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']},
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
});

client.initialize();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

app.post('/send',
    body('number').notEmpty(),
    body('message').notEmpty(),
    (req, res) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            try{
                const number = req.body.phone_number;
                const text = req.body.message;
                const chatId = number.substring(0) + "@c.us";
                
                client.sendMessage(chatId, text);
                return res.status(200).json({
                    status: "ok",
                    detail : req.body
                });
            }catch(err) {
                console.log(err)
                return res.status(500).send(err)
            }
        }
        res.send({ errors: result.array() });
    }
)

app.listen(port, () => {
    console.log(`Listen on ${port}`)
})
 