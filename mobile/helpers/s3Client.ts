import AWS from 'aws-sdk';
import Constants from 'expo-constants';
import crypto from "crypto";

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
const accessKeyId = reconstructKey(accessKeyIdParts);
const secretAccessKey = reconstructKey(secretAccessKeyParts);

// Configure the AWS SDK
AWS.config.update({
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // region: process.env.AWS_REGION,
  region: "us-east-2",
});

const s3 = new AWS.S3();

export default s3