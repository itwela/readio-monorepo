import AWS from 'aws-sdk';
import Constants from 'expo-constants';
import { S3 } from 'aws-sdk';
import {
  paginateListBuckets,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import 'react-native-get-random-values';

// Validate that all dummy parts exist
if (
  !Constants.expoConfig?.extra?.AWS_ACCESS_KEY_ID_PART1 ||
  !Constants.expoConfig?.extra?.AWS_SECRET_ACCESS_KEY_PART1
) {
  throw new Error("AWS dummy credentials not found in expo config");
}

// Extract dummy parts and salt from Expo config
const extra = Constants.expoConfig.extra;

const accessKeyIdParts = [
  extra.AWS_ACCESS_KEY_ID_PART1,
  extra.AWS_ACCESS_KEY_ID_PART2,
];

const secretAccessKeyParts = [
  extra.AWS_SECRET_ACCESS_KEY_PART1,
  extra.AWS_SECRET_ACCESS_KEY_PART2,
  extra.AWS_SECRET_ACCESS_KEY_PART3,
];

const salt = extra.SALT; // Optional salt for added security (not required here)

// Function to combine parts into the full key
const reconstructKey = (parts: string[]) => parts.join("");

// Reconstruct 
export const accessKeyId = reconstructKey(accessKeyIdParts);
export const secretAccessKey = reconstructKey(secretAccessKeyParts);

// Configure the AWS SDK
AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: "us-east-2",
});

// export const s3 = new AWS.S3({ 
//   accessKeyId: accessKeyId,
//   secretAccessKey: secretAccessKey,
//   region: 'us-east-2' 
// });

export const s3 = new S3Client({
credentials: {
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
},
region: "us-east-2",
});

export const helloS3 = async () => {
  // When no region or credentials are provided, the SDK will use the
  // region and credentials from the local AWS config.
  const client = s3bucket.listBuckets().promise();

  try {
    const test = await client
    console.log(test);
  } catch (err) {
    console.log(err);
  }
};


export const s3bucket = new S3({
  region: 'us-east-2' ,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

// Use the Bucket property when making request
