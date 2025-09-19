import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  query,            
  where,            
  orderBy 
} from "firebase/firestore";

const { getReactNativePersistence } = require("firebase/auth") as any

const firebaseConfig = {
  apiKey: "AIzaSyCdr5dUR-R7JujZuBxQfKc3lA-r2nJ5n_k",
  //apiKey: "AIzaSyCHs010B2yosXbwP78eCTL8v7SYL3e_geA",
  authDomain: "projetofirebase-df892.firebaseapp.com",
  projectId: "projetofirebase-df892",
  storageBucket: "projetofirebase-df892.firebasestorage.app",
  messagingSenderId: "548744326102",
  appId: "1:548744326102:web:bbf1440ca36459a013d277"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ✅ Exportar TODOS os itens necessários
export { 
  auth, 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  query,           
  where,
  orderBy          
}