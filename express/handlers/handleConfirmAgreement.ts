import { json } from 'body-parser';
import fs from 'fs';

const fileURL = 'db/user.json';

export default (reqBody: any) => {
  const parsedBody = JSON.parse(reqBody);
  const { email, phone_number } = parsedBody;
  
  const rawFileData: any = fs.readFileSync(fileURL);
  const parsedUserData = JSON.parse(rawFileData);

  const lastRecordedId = parsedUserData.length;

  const obj = {
    id: lastRecordedId + 1,
    email,
    phone_number,
    is_top_up_sms_activated: true,
    is_ovo_activated: true,
  };

  const newDataStruct = [...parsedUserData, obj];

  fs.writeFile(fileURL, JSON.stringify(newDataStruct, null, '\t'), err => {
    if (err) throw err;
  });

  return { success: true };
};