import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
    apiKey: apiKey && apiKey !== 'your_firebase_api_key' ? apiKey : 'AIzaSyDummyApiKeyForDevelopmentOnly12345',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ecommerce-app.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ecommerce-app',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ecommerce-app.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:1234567890abcdef',
};

let app: FirebaseApp;
let auth: Auth;

try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.warn('⚠️ Firebase Initialization Warning: Check VITE_FIREBASE_* keys in client/.env', error);
    app = getApps().length ? getApp() : initializeApp({ apiKey: 'AIzaSyDummyApiKeyForDevelopmentOnly12345' });
    auth = getAuth(app);
}

export { auth };
