import http from 'http';
import fs from 'fs';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Http2Server } from 'http2';
import twilio from 'twilio';

import smsValidator from './middleware/smsValidator';
const fileURL = 'db/user.json';

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
   * smsValidator we check the sms body format first
   */
  app.post('/sms', smsValidator, (req, res) => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const msgBody = req.body.Body;
    console.log('message received', msgBody);
    const rawFileData = fs.readFileSync(fileURL);
    const parsedUserData = JSON.parse(rawFileData);
    const msgBody = req.body.Body;

    const parsedMessage = msgBody.split('#');
    const phoneNumber = parsedMessage[1];
    /**
     * Start multiple background processing here
     */
    const userRequestData = parsedUserData.find(data => data.phone_number === phoneNumber);

    if (userRequestData) {
      const isUserTopUpSMSActivated = userRequestData.is_top_up_sms_activated;
      const isOvoActivated = userRequestData.is_ovo_activated;

      if (isUserTopUpSMSActivated && isOvoActivated) {
        /**
         * SUCCESS
         * If everything is good we will send this success message to user
         */
        twiml.message('Tokopedia - Isi ulang pulsa kamu BERHASIL untuk SN: 321321321321 senilai 50000');
      }
      /**
       * If any of the conditions above are not achieved, then we will notify the user on the reasons
       */
      else if (!isUserTopUpSMSActivated) {
        twiml.message('Tokopedia - Top up SMS anda belum teraktivasi');
      }
      else if (!isOvoActivated) {
        twiml.message('Tokopedia - OVO anda belum teraktivasi');
      }
    } else {
      twiml.message('Tokopedia - Nomor telepon belum terdaftar');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

  const server = http.createServer(app);

  return { app, server };
};
