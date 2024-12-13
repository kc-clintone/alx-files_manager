/* eslint-disable no-unused-vars */
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
import mimeMessage from 'mime-message';
import { gmail_v1 as gmailV1, google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const PATH_TO_TOKEN = 'token.json';
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readLine.question('Enter code from that page here: ', (code) => {
    readLine.close();
    oAuth2Client.getToken(code, (error, token) => {
      if (error) {
        console.error('Error retrieving the access token', error);
        return;
      }
      oAuth2Client.setCredentials(token);
      writeFileAsync(PATH_TO_TOKEN, JSON.stringify(token))
        .then(() => {
          console.log('Token stored in path', PATH_TO_TOKEN);
          callback(oAuth2Client);
        })
        .catch((writeErr) => console.error(writeErr));
    });
  });
}

async function authorize(credentials, callback) {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectURIs = credentials.web.redirect_uris;
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0],
  );
  console.log('Starting client authorization...');
  await readFileAsync(PATH_TO_TOKEN)
    .then((token) => {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    }).catch(async () => getNewToken(oAuth2Client, callback));
  console.log('Authorization done');
}

function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.send({
    userId: 'me',
    requestBody: mail,
  }, (error, _res) => {
    if (error) {
      console.log(`The API returned an error: ${error.message || error.toString()}`);
      return;
    }
    console.log('Message sent successfully');
  });
}

export default class Mailer {
  static checkAuth() {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(JSON.parse(content), (auth) => {
          if (auth) {
            console.log('Auth check successful');
          }
        });
      })
      .catch((error) => {
        console.log('Error loading client secret file:', error);
      });
  }

  static buildMessage(dest, subject, message) {
    const senderEmail = process.env.GMAIL_SENDER;
    const msgData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [dest],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject,
      body: message,
    };

    if (!senderEmail) {
      throw new Error(`Invalid sender: ${senderEmail}`);
    }
    if (mimeMessage.validMimeMessage(msgData)) {
      const mime = mimeMessage.createMimeMessage(msgData);
      return { raw: mime.toBase64SafeString() };
    }
    throw new Error('Invalid MIME message');
  }

  static sendMail(mail) {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(
          JSON.parse(content),
          (auth) => sendMailService(auth, mail),
        );
      })
      .catch((error) => {
        console.log('Error loading client secret file:', error);
      });
  }
}
