import http from 'http';
import fs from 'fs';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Http2Server } from 'http2';
import twilio from 'twilio';

import smsValidator from './middleware/smsValidator';
import userValidation from './middleware/userValidation';
import handleConfirmAgreement from './handlers/handleConfirmAgreement';

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
