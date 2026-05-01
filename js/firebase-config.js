/* ============================================
   MindBloom — Firebase Configuration
   ============================================
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project named "MindBloom"
   3. Add a Web App ( </> icon )
   4. Copy your firebaseConfig object below
   5. Enable Authentication → Email/Password + Google
   6. Enable Firestore Database (Start in test mode)
   ============================================ */

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.db   = firebase.firestore();
window.auth = firebase.auth();

// Enable offline persistence (works offline like localStorage)
firebase.firestore().enablePersistence({ synchronizeTabs: true })
  .catch(err => console.warn('Offline persistence error:', err.code));
