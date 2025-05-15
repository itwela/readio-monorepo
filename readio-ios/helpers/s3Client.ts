import { S3 } from '@aws-sdk/client-s3';
import Constants from 'expo-constants';
import 'react-native-get-random-values';

// if (
//   !Constants.expoConfig?.extra?.AWS_ACCESS_KEY_ID_PART1 ||
//   !Constants.expoConfig?.extra?.AWS_SECRET_ACCESS_KEY_PART1
// ) {
//   throw new Error("AWS dummy credentials not found in expo config");
// }
// const extra = Constants.expoConfig.extra;
// const accessKeyIdParts = [
//   extra.AWS_ACCESS_KEY_ID_PART1,
//   extra.AWS_ACCESS_KEY_ID_PART2,
// ];
// const secretAccessKeyParts = [
//   extra.AWS_SECRET_ACCESS_KEY_PART1,
//   extra.AWS_SECRET_ACCESS_KEY_PART2,
//   extra.AWS_SECRET_ACCESS_KEY_PART3,
// ];
// const salt = extra.SALT; // Optional salt for added security (not required here)
// const reconstructKey = (parts: string[]) => parts.join("");

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = Constants?.expoConfig?.extra || {};

// Reconstruct 
export const accessKeyId = AWS_ACCESS_KEY_ID;
export const secretAccessKey = AWS_SECRET_ACCESS_KEY;

export const helloS3 = async () => {
};


export const s3 = new S3({
  region: 'us-east-2',

  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

// Use the Bucket property when making request
