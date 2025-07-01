import { Client, Databases, Account, Storage, Functions } from "appwrite";
import { type Models } from 'appwrite';

// Configurazione client Appwrite
const client: Client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Esporta i servizi Appwrite
export const account: Account = new Account(client);
export const databases: Databases = new Databases(client);
export const storage: Storage = new Storage(client);
export const functions: Functions = new Functions(client);

// Esporta utility
export { ID } from 'appwrite';
export type { Models };

// Esporta il client per usi avanzati
export { client }; 