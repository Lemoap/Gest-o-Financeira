import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Configuração do Firebase (vírgula corrigida no appId)
const firebaseConfig = {
    apiKey: "AIzaSyApuYL1r71sxVgqlnXFgvh35196XWIDcpo",
    authDomain: "gestao-financeira-pessoa-a796d.firebaseapp.com",
    projectId: "gestao-financeira-pessoa-a796d",
    storageBucket: "gestao-financeira-pessoa-a796d.firebasestorage.app",
    messagingSenderId: "781370902733",
    appId: "1:781370902733:web:80f94bd98e795ca5594184", // Vírgula corrigida
    measurementId: "G-554603496"
};

// 1. Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicializa o banco de dados Firestore
export const db = getFirestore(app);

// 3. Função para adicionar uma nova transação
export async function addTransaction() {
    try {
        const docRef = await addDoc(collection(db, "transactions"), {
            description: "Groceries",
            amount: 45.50,
            date: new Date()
        });
        console.log("Transaction saved with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// 4. Função para ler e listar as transações
export async function getTransactions() {
    try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} =>`, doc.data());
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

