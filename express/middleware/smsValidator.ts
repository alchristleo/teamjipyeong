import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';

const ALLOWED_PREFIX = ['TOPEDPULSA', 'TOPEDDATA'];
const ALLOWED_PLAN_CODE = ['P25', 'P50', 'P100', 'D2', 'D4', 'D8'];

export default (req: Request, res: Response, next: NextFunction) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msgBody = req.body.Body;
  const splitMsg = msgBody.split('#');
  
  if (splitMsg.length < 4) {
    twiml.message('Tokopedia - Maaf format yang kamu kirim salah, gunakan format sebagai berikut: KODE_PRODUK#NO_HP#PLAN#TOKEN_AUTENTIKASI_OVO');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    throw new Error(`sms validator error`);
  }

  if (ALLOWED_PREFIX.indexOf(splitMsg[0]) === -1) {
    twiml.message('Tokopedia - Maaf Kode Produk yang kamu masukkan salah, format tesedia: TOPEDPULSA, TOPEDDATA');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    throw new Error(`sms validator error`);
  }

  if (!/^[0-9]*$/.test(splitMsg[1])) {
    twiml.message('Tokopedia - Maaf Nomor Handphone yang kamu masukkan salah, gunakan format sebagai berikut: 08123456789');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    throw new Error(`sms validator error`);
  }
  
  if (ALLOWED_PLAN_CODE.indexOf(splitMsg[2]) === -1) {
    twiml.message('Tokopedia - Maaf Nomor Plan yang kamu masukkan salah, format tersedia: P25, P50, P100, D2, D4, D8');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    throw new Error(`sms validator error`);
  }
  
  next();
};
