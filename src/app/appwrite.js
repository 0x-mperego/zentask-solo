import { Account, Client } from 'appwrite';

export const client = new Client();

client
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('6863bcd3000de9acd0a1'); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';
