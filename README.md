# 📋 Todo App - Gerenciador de Tarefas  

Um aplicativo mobile completo de gerenciamento de tarefas desenvolvido em **React Native com Expo**, utilizando **Firebase** como backend.  

## 🚀 Funcionalidades  

- 🔑 Autenticação completa com **Email/Senha** e **Google Sign-In**  
- 🔒 Login persistente (usuário permanece logado)  
- ✅ Gerenciamento de tarefas por usuário com **sincronização em tempo real**  
- 🌓 Tema **claro/escuro** com persistência da preferência  
- 🌐 **Internacionalização (PT/EN)** com troca dinâmica de idioma  
- 🔔 **Notificações locais** agendadas para lembretes de tarefas  
- 💬 Frases motivacionais via **API externa** (com TanStack Query)  
- 📱 Interface responsiva adaptada para diferentes tamanhos de tela  

---

## 🛠 Tecnologias Utilizadas  

- [React Native](https://reactnative.dev/) com [Expo Router](https://expo.dev/)  
- [Firebase Authentication](https://firebase.google.com/docs/auth) & [Firestore Database](https://firebase.google.com/docs/firestore)  
- [TanStack Query](https://tanstack.com/query/latest) para gerenciamento de estado e API calls  
- [React Native Paper](https://callstack.github.io/react-native-paper/) para componentes UI  
- [React i18next](https://react.i18next.com/) para internacionalização  
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) para persistência local  
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) para notificações locais  

---

## 📋 Pré-requisitos  

- Node.js **16+**  
- npm ou yarn  
- Expo CLI  
- Conta no Firebase  
- App **Expo Go** para testes  

---

## ⚙️ Instalação  

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd ListaDeTarefas

# Instale as dependências
npm install
```


🔥 Configuração do Firebase

Crie um projeto no Firebase Console

Ative Authentication (Email/Password + Google)

Crie um Firestore Database

Baixe o arquivo de configuração e atualize src/services/firebaseConfig.ts com suas credenciais

Configure as regras do Firestore:



rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid != null;
    }
  }
}



▶️ Execução
```
npm run android   # Executa no Android
npm run ios       # Executa no iOS
npm start         # Executa em todas as plataformas
npm run web       # Executa no navegador

```



## DESENVOLVEDORES

RM557774  -JÚLIO
RM554945  -NATHÁLIA GOMES
RM558785  -JÚLIA
