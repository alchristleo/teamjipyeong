import http from 'http';
import fs from 'fs';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Http2Server } from 'http2';
import twilio from 'twilio';

import smsValidator from './middleware/smsValidator';
import userValidation from './middleware/userValidation';
import handleConfirmAgreement from './handlers/handleConfirmAgreement';
const userFileURL = 'db/user.json';
const transactionFileURL = 'db/transaction.json';

export default (): { app: Application; server: Http2Server } => {
  const app = express();

  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', '*');

    // handle CORS on local development
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        res.status(200);
        res.send();

        return;
      }
    }
    next();
  });

  /**
   *
   *
   * ===================================================
   * ++++++++++++++++++++++ API ++++++++++++++++++++++++
   * ===================================================
   *
   *
   * calling smsValidator we check the sms body format first
   */
  app.post('/sms', smsValidator, userValidation, (req, res) => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const msgBody = req.body.Body;
    console.log('message received', msgBody);

    const parsedMessage = msgBody.split('#');
    const rawUserData = fs.readFileSync(userFileURL);
    const parsedUserData = JSON.parse(rawUserData);
    const phoneNumber = parsedMessage[1];
    const productCode = parsedMessage[2];
    const userRequestData = parsedUserData.find((data: any) => data.phone_number === phoneNumber);
    

    const rawTransactionData = fs.readFileSync(transactionFileURL);
    const parsedTransactionData = JSON.parse(rawTransactionData);

    const transactionItem = {
      id: parsedTransactionData.length + 1,
      product_code: productCode,
      phone_number: phoneNumber,
      transaction_date: new Date().toDateString(),
      user_id: userRequestData.id,
    };

    const newTransactionData = [...parsedTransactionData, transactionItem];

    const stringifiedTransactionData = JSON.stringify(newTransactionData);
    fs.writeFile(transactionFileURL, stringifiedTransactionData, err => {
      if (err) throw err;
    });

    twiml.message('Tokopedia - Isi ulang pulsa kamu BERHASIL untuk SN: 321321321321 senilai 50000');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

  app.post('/agreement', async (req, res) => {
    const reqBody = req.body;
    res.json(await handleConfirmAgreement(reqBody));
  });

  const server = http.createServer(app);

  return { app, server };
};
