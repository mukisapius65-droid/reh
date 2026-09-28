// assets/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  writeBatch,
  doc,
  setDoc,
  collectionGroup,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  addDoc,
  deleteDoc,
  increment,
  Timestamp,
  deleteField,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyClJ9Mlln04N_7XFSvy1zGHaE6w5E2DQ8I",
  authDomain: "rehp-c82b8.firebaseapp.com",
  projectId: "rehp-c82b8",
  storageBucket: "rehp-c82b8.firebasestorage.app",
  messagingSenderId: "363083908702",
  appId: "1:363083908702:web:33e7d66890c9ef79fb96cf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ── Named exports (for modern ES modules) ──
export {
  app,
  auth,
  db,
  storage,
  // Auth
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
	GoogleAuthProvider,
signInWithPopup,
signInWithRedirect,
getRedirectResult,
  // Firestore
  writeBatch,
  doc,
  setDoc,
  collectionGroup,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  addDoc,
  deleteDoc,
  increment,
  Timestamp,
  deleteField,
  // Storage
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
};

// ── Keep window assignments for legacy pages ──
window.app = app;
window.auth = auth;
window.db = db;
window.storage = storage;

// Auth
window.onAuthStateChanged = onAuthStateChanged;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signOut = signOut;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.setPersistence = setPersistence;
window.browserLocalPersistence = browserLocalPersistence;
window.browserSessionPersistence = browserSessionPersistence;
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.signInWithRedirect = signInWithRedirect;
window.getRedirectResult = getRedirectResult;

// ── Google sign-in helper (popup on desktop, redirect on mobile) ──
window._rehGoogleSignIn = async function () {
  const provider = new GoogleAuthProvider();
  // Set persistence BEFORE the redirect — required so the Auth session
  // survives the round-trip to Google and back. Without this, mobile
  // browsers sometimes lose the session and the user lands "logged out".
  await setPersistence(auth, browserLocalPersistence);
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (isMobile) {
  sessionStorage.setItem('reh_google_pending', '1');
  sessionStorage.setItem('reh_google_pending_at', String(Date.now()));
  await signInWithRedirect(auth, provider);
  return null;
}
  return await signInWithPopup(auth, provider);
};

// Firestore
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.collection = collection;
window.getDocs = getDocs;
window.query = query;
window.orderBy = orderBy;
window.limit = limit;
window.where = where;
window.onSnapshot = onSnapshot;
window.serverTimestamp = serverTimestamp;
window.addDoc = addDoc;
window.deleteDoc = deleteDoc;
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;
window.collectionGroup = collectionGroup;
window.writeBatch = writeBatch;
window.increment = increment;
window.Timestamp = Timestamp;
window.deleteField = deleteField;

// Storage
window.storageRef = ref;
window.uploadBytes = uploadBytes;
window.getDownloadURL = getDownloadURL;

console.log(
  "[firebase] Initialized with Auth, Firestore, and Storage (modular exports available).",
);

// ── Auth state guard ─────────────────────────────
// authStateReady() resolves after Firebase Auth finishes initializing.
// Without it, the listener would fire null during init and wipe valid sessions.
auth.authStateReady().then(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) return;

    let cached = null;
    try {
      cached = JSON.parse(
        localStorage.getItem('reh_user') || sessionStorage.getItem('reh_user') || 'null'
      );
    } catch (e) { /* malformed */ }

    if (!cached || !cached.uid) return;

    // Don't clear if we're mid-Google-flow — the Auth session may still be
    // settling after the redirect round-trip. Give it 3 seconds.
    if (sessionStorage.getItem('reh_google_pending') === '1') {
      console.log('[auth] ghost guard deferred — Google flow in progress');
      return;
    }

    try {
      localStorage.removeItem('reh_user');
      sessionStorage.removeItem('reh_user');
    } catch (e) { /* ignore */ }
  });
});
