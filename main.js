const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { body, validationResult } = require('express-validator');
const express = require('express')
const cors = require('cors')
const basicAuth = require('express-basic-auth')

const app = express()
const port = 3003
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
                let number = req.body.number;
                const text = req.body.message;
                if (number.substring(0,2)=="08"||number.substring(0,2)!="62"){
                    number = "62"+number.substring(1)
                }
                // console.log(number);
                const chatId = number.substring(0) + "@c.us";
                
                client.sendMessage(chatId, text);
                return res.status(200).json({
                    status: "ok",
                    detail : {number,chatId,text}
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
 