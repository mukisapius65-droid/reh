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
  increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Expose globally
window.auth = auth;
window.db = db;
window.onAuthStateChanged = onAuthStateChanged;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signOut = signOut;
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
