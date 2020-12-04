import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';

const userFileURL = 'db/user.json';
const productFileURL = 'db/product.json';

export default (req: Request, res: Response, next: NextFunction) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msgBody = req.body.Body;

  const rawFileData: any = fs.readFileSync(userFileURL);
  const parsedUserData = JSON.parse(rawFileData);

  const rawProductData: any = fs.readFileSync(productFileURL);
  const parsedProductData = JSON.parse(rawProductData);

  const parsedMessage = msgBody.split('#');
  const selectedProfileCodeStr = parsedMessage[0];
  const phoneNumber = parsedMessage[1];
  const selectedPlanCodeStr = parsedMessage[2];
  /**
   * Start multiple background processing here
   */
  const userRequestData = parsedUserData.find((data: any) => data.phone_number === phoneNumber);

  if (userRequestData) {
    const isUserTopUpSMSActivated = userRequestData.is_top_up_sms_activated;
    const isOvoActivated = userRequestData.is_ovo_activated;

    const selectedProductData = parsedProductData.find(
      (data: any) => data.profile_code === selectedProfileCodeStr && data.plan_code === selectedPlanCodeStr,
    );

    const isOvoBalanceSufficient = userRequestData.ovo_balance >= selectedProductData.price;

    /**
     * If any of the conditions above are not achieved, then we will notify the user on the reasons
     */
    if (isUserTopUpSMSActivated && isOvoActivated && isOvoBalanceSufficient) {
      next();
    } else if (!isUserTopUpSMSActivated) {
      twiml.message('Tokopedia - Top up SMS anda belum teraktivasi');

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } else if (!isOvoActivated) {
      twiml.message('Tokopedia - OVO anda belum teraktivasi');

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } else if (!isOvoBalanceSufficient) {
      twiml.message('Tokopedia - Saldo OVO anda tidak mencukupi');

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  } else {
    twiml.message('Tokopedia - Nomor telepon belum terdaftar');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};
