import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';

const fileURL = 'db/user.json';

export default (req: Request, res: Response, next: NextFunction) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msgBody = req.body.Body;
  
  const rawFileData: any = fs.readFileSync(fileURL);
  const parsedUserData = JSON.parse(rawFileData);

  const parsedMessage = msgBody.split('#');
  const phoneNumber = parsedMessage[1];
  /**
   * Start multiple background processing here
   */
  const userRequestData = parsedUserData.find((data: any) => data.phone_number === phoneNumber);

  if (userRequestData) {
    const isUserTopUpSMSActivated = userRequestData.is_top_up_sms_activated;
    const isOvoActivated = userRequestData.is_ovo_activated;

    /**
     * If any of the conditions above are not achieved, then we will notify the user on the reasons
     */
    if (isUserTopUpSMSActivated && isOvoActivated) {
      next();
    } else if (!isUserTopUpSMSActivated) {
      twiml.message('Tokopedia - Top up SMS anda belum teraktivasi');

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } else if (!isOvoActivated) {
      twiml.message('Tokopedia - OVO anda belum teraktivasi');

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  } else {
    twiml.message('Tokopedia - Nomor telepon belum terdaftar');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};
