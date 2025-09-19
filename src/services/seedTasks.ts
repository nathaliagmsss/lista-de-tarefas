import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

const criarTasksIniciais = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("Nenhum usuário logado!");
    return;
  }

  const userId = user.uid;

  const tasks = [
    { title: "Comprar leite", description: "Ir ao mercado", completed: false, dueDate: "2025-09-19" },
    { title: "Estudar TypeScript", description: "Revisar conceitos", completed: false, dueDate: "2025-09-20" },
    { title: "Exercício físico", description: "Academia 1h", completed: false, dueDate: "2025-09-21" },
  ];

  for (const task of tasks) {
    await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
    });
  }

  console.log("Tasks iniciais criadas!");
};

criarTasksIniciais();