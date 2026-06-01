/**
 * firebase.js — THA Valorant Profile
 * Firebase Modular SDK v10.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDX4wrgE33kP-3XnFfUxrfmPQMEOfdADuw",
  authDomain: "thay-524d7.firebaseapp.com",
  projectId: "thay-524d7",
  storageBucket: "thay-524d7.firebasestorage.app",
  messagingSenderId: "627545402341",
  appId: "1:627545402341:web:99b5e01e389d26ad149d0c"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.useDeviceLanguage();

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});