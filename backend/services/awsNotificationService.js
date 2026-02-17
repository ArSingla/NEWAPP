const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const region = process.env.AWS_REGION;

const awsClientConfig = {
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

const sesClient = new SESClient(awsClientConfig);
const snsClient = new SNSClient(awsClientConfig);

const ensureAwsConfig = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !region) {
    throw new Error('AWS credentials/region are not configured');
  }
};

const sendEmailOtp = async ({ toEmail, otp, purpose }) => {
  ensureAwsConfig();

  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error('AWS_SES_FROM_EMAIL is not configured');
  }

  const subject = purpose === 'forgot' ? 'Password Reset OTP' : 'Account Verification OTP';
  const bodyText = `Your OTP is ${otp}. It expires in 5 minutes.`;

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Text: {
          Data: bodyText,
          Charset: 'UTF-8'
        }
      }
    }
  });

  await sesClient.send(command);
};

const sendSmsOtp = async ({ phoneNumber, otp, purpose }) => {
  ensureAwsConfig();

  const messagePrefix = purpose === 'forgot' ? 'Password reset' : 'Account verification';
  const command = new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: `${messagePrefix} OTP: ${otp}. Expires in 5 minutes.`
  });

  await snsClient.send(command);
};

module.exports = {
  sendEmailOtp,
  sendSmsOtp
};
