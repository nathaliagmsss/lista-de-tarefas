import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig'
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { t, i18n } = useTranslation()
  const { colors } = useTheme()
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter()

  // Configuração do Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '425057294849-ivm2ohfoin38tbgrr96sg2kqktfr3bkp.apps.googleusercontent.com',
  });

  // Função para mudar idioma
  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const verificarUsuarioLogado = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("@user")
      if (usuarioSalvo) {
        router.push('/HomeScreen')
      }
    } catch (error) {
      console.log("Erro ao verificar login", error)
    }
  }

  useEffect(() => {
    verificarUsuarioLogado()
  }, [])

  // Google Sign-In
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await AsyncStorage.setItem('@user', JSON.stringify(user))
          router.push('/HomeScreen')
        })
        .catch((error) => {
          Alert.alert("Erro", "Falha no login com Google")
        });
    }
  }, [response]);

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await AsyncStorage.setItem('@user', JSON.stringify(user))
        router.push('/HomeScreen')
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
          Alert.alert("Erro", "Email ou senha incorretos.")
        }
      });
  };

  const esqueceuSenha = () => {
    if (!email) {
      alert("Digite seu e-mail para recuperar a senha..")
      return
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Enviado e-mail de recuperação de senha")
      })
      .catch((error) => {
        console.log("Error:", error.message)
        alert("Erro ao enviar e-mail de recuperação")
      })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.text }]}>{t("login")}</Text>

      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="E-mail"
        placeholderTextColor={colors.text}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={t("password")}
        placeholderTextColor={colors.text}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Login</Text>
      </TouchableOpacity>

      {/* Botão Google Sign-In */}
      <TouchableOpacity 
        style={[styles.botao, styles.botaoGoogle]} 
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.textoBotao}>{t("signInWithGoogle")}</Text>
      </TouchableOpacity>

      <ThemeToggleButton />

      <View style={styles.idiomaContainer}>
        <TouchableOpacity onPress={() => mudarIdioma("pt")}>
          <Text style={[styles.idioma, { color: colors.text }]}>PT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => mudarIdioma("en")}>
          <Text style={[styles.idioma, { color: colors.text }]}>EN</Text>
        </TouchableOpacity>
      </View>

      <Link href="CadastrarScreen" style={[styles.link, { color: colors.text }]}>
        {t("register")}
      </Link>

      <Text style={[styles.link, { color: colors.text }]} onPress={esqueceuSenha}>
        {t("forgotPassword")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    backgroundColor: '#00B37E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoGoogle: {
    backgroundColor: '#4285F4',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  idiomaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  idioma: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});