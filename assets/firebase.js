// assets/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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

// Storage
window.storageRef = ref;
window.uploadBytes = uploadBytes;
window.getDownloadURL = getDownloadURL;

console.log('[firebase] Initialized with Auth, Firestore, and Storage (modular exports available).');