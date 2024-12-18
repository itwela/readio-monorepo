import AWS from 'aws-sdk';
import Constants from 'expo-constants';

if (!Constants.expoConfig?.extra?.AWS_ACCESS_KEY_ID || !Constants.expoConfig?.extra?.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not found in expo config');
}

const aKi = Constants.expoConfig.extra.AWS_ACCESS_KEY_ID;
const sEc = Constants.expoConfig.extra.AWS_SECRET_ACCESS_KEY;

console.log(aKi, sEc)

// Configure the AWS SDK
AWS.config.update({
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessKeyId: aKi,
  secretAccessKey: sEc,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // region: process.env.AWS_REGION,
  region: "us-east-2",
});

const s3 = new AWS.S3();

export default s3