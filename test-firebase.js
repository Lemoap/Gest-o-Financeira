import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyApuYL1r71sxVgqlnXFgvh35196XWIDcpo",
    authDomain: "gestao-financeira-pessoa-a796d.firebaseapp.com",
    projectId: "gestao-financeira-pessoa-a796d",
    storageBucket: "gestao-financeira-pessoa-a796d.firebasestorage.app",
    messagingSenderId: "781370902733",
    appId: "1:781370902733:web:80f94bd98e795ca5594184",
    measurementId: "G-554603496"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    console.log("Testing Firestore Connection...");
    try {
        const docRef = doc(db, 'app_config', 'test_write');
        console.log("Writing to app_config/test_write...");
        await setDoc(docRef, { timestamp: new Date().toISOString() });
        console.log("Write success!");
    } catch (e) {
        console.error("Firestore Error:", e.message || e);
    }
    process.exit();
}

test();
