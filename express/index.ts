import http from 'http';
import fs from 'fs';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Http2Server } from 'http2';
import twilio from 'twilio';
import chalk from 'chalk';

import smsValidator from './middleware/smsValidator';
import userValidation from './middleware/userValidation';
import handleConfirmAgreement from './handlers/handleConfirmAgreement';

const userFileURL = 'db/user.json';
const transactionFileURL = 'db/transaction.json';
const productFileURL = 'db/product.json';

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
   * calling userValidator middleware
   */
  app.post('/sms', smsValidator, userValidation, (req, res) => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const msgBody = req.body.Body;
    console.log('message received', msgBody);

    const parsedMessage = msgBody.split('#');
    const rawUserData: any = fs.readFileSync(userFileURL);
    const parsedUserData = JSON.parse(rawUserData);
    const profileCode = parsedMessage[0];
    const phoneNumber = parsedMessage[1];
    const planCode = parsedMessage[2];
    const userRequestData = parsedUserData.find((data: any) => data.phone_number === phoneNumber);

    const rawTransactionData: any = fs.readFileSync(transactionFileURL);
    const parsedTransactionData = JSON.parse(rawTransactionData);

    const rawProductData: any = fs.readFileSync(productFileURL);
    const parsedProductData = JSON.parse(rawProductData);

    const selectedProductData = parsedProductData.find(
      (data: any) => data.profile_code === profileCode && data.plan_code === planCode,
    );

    const remainingOvoBalance = userRequestData.ovo_balance - selectedProductData.price;

    const newUserData = parsedUserData.map((data: any) => {
      if (data.id === userRequestData.id) {
        const newBalance = remainingOvoBalance;
        return {
          ...data,
          ovo_balance: newBalance,
        };
      }
      return data;
    });
    console.log(chalk.red(`======Successfully deduct user ovo balance with id: ${userRequestData.id} ✅`));

    fs.writeFile(userFileURL, JSON.stringify(newUserData, null, '\t'), err => {
      if (err) throw err;
    });

    const generatedSerialNumber = Math.floor(Math.random() * 1000000000);;
    const transactionItem = {
      id: parsedTransactionData.length + 1,
      product_code: profileCode,
      phone_number: phoneNumber,
      transaction_date: new Date().toDateString(),
      user_id: userRequestData.id,
      serial_number: generatedSerialNumber,
    };

    const newTransactionData = [...parsedTransactionData, transactionItem];
    console.log(chalk.red('======New Transaction successfully created ✅'));

    fs.writeFile(transactionFileURL, JSON.stringify(newTransactionData, null, '\t'), err => {
      if (err) throw err;
    });

    const profileCodeToText = profileCode === 'TOPEDPULSA' ? 'pulsa' : `paket data ${selectedProductData.description}`;
    twiml.message(`Tokopedia - Isi ulang ${profileCodeToText} kamu BERHASIL untuk SN: ${generatedSerialNumber} senilai ${selectedProductData.price}`);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

  /**
   * agreement endpoint to insert new user from frontend.
   */
  app.post('/agreement', (req, res) => {
    const reqBody = req.body;
    res.json(handleConfirmAgreement(reqBody));
  });

  const server = http.createServer(app);

  return { app, server };
};
