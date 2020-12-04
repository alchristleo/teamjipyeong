import fs from 'fs';

const fileURL = 'db/user.json';

export default async (reqBody: Record<string, string>) => {
  const { email, phone_number } = reqBody;

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