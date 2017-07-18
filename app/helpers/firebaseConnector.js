import jwtToken from './jwtToken';
import * as Firebase from 'firebase';

const config = {
  apiKey: process.env.FIREBASE_JS_CLIENT_API_KEY,
  authDomain: process.env.FIREBASE_JS_CLIENT_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_JS_CLIENT_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_JS_CLIENT_MESSAGING_SENDER_ID,
};

Firebase.initializeApp(config);

Firebase.auth().signInWithCustomToken(jwtToken).catch((error) => {
  console.error('firebase sign in error', error); // eslint-disable-line
});

const firebase = Firebase.database();

export default firebase;
