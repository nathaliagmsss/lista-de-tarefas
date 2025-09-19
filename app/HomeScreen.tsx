import { Text, Button, Alert, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import TaskItem from "../src/components/TaskItem";
import { useEffect, useState } from "react";
import { auth } from '../src/services/firebaseConfig'
import { deleteUser } from "firebase/auth";
import { collection, addDoc, db, getDocs, query, where, orderBy, Timestamp } from "../src/services/firebaseConfig";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from 'react-i18next';
// import * as Notifications from "expo-notifications"  // ← REMOVIDO TEMPORARIAMENTE
import { useMotivationalQuote } from '../src/services/api';


interface Task {
    id: string,
    title: string,
    description: string,
    completed: boolean,
    dueDate: string,
    createdAt: any,
    updatedAt: any,
    userId: string
}

export default function HomeScreen() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Amanhã
    const router = useRouter()
    const [listaTasks, setListaTasks] = useState<Task[]>([])

    // Hook do TanStack Query para frase motivacional
    const { data: quote, isLoading: quoteLoading, refetch: refetchQuote } = useMotivationalQuote();

    const buscarTasks = async () => {
        try {
            const user = auth.currentUser
            if (!user) return

            const q = query(
                collection(db, 'tasks'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const tasks: Task[] = []

            querySnapshot.forEach((doc) => {
                tasks.push({
                    ...doc.data(),
                    id: doc.id
                } as Task)
            })

            setListaTasks(tasks)
        } catch (e) {
            console.log("Error ao buscar as tasks:", e)
        }
    }

    const salvarTask = async () => {
        if (!title.trim()) {
            Alert.alert("Atenção", "Digite o título da tarefa")
            return
        }

        try {
            const user = auth.currentUser
            if (!user) {
                Alert.alert("Erro", "Usuário não logado")
                return
            }

            await addDoc(collection(db, 'tasks'), {
                title: title,
                description: description,
                completed: false,
                dueDate: dueDate.toISOString(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                userId: user.uid
            })

            Alert.alert("Sucesso", "Tarefa criada com sucesso.")
            setTitle('')
            setDescription('')
            setDueDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
            buscarTasks()
        } catch (e) {
            console.log("Error ao criar a tarefa:", e)
            Alert.alert("Erro", "Erro ao criar tarefa")
        }
    }

    const excluirConta = () => {
        Alert.alert("CONFIRMAR EXCLUSÃO", "Tem certeza que deseja excluir a conta? Esta ação não poderá ser desfeita.",
            [
                { text: "Cancelar", style: 'cancel' },
                {
                    text: "Excluir", style: 'destructive',
                    onPress: async () => {
                        try {
                            const user = auth.currentUser
                            if (user) {
                                await deleteUser(user)
                                await AsyncStorage.removeItem('@user')
                                Alert.alert("Conta Excluída", "Conta excluída com sucesso.")
                                router.push('/')
                            }
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível excluir a conta.")
                        }
                    }
                }
            ]
        )
    }

    const realizarLogoff = async () => {
        await AsyncStorage.removeItem('@user')
        router.replace('/')
    }


    useEffect(() => {
        buscarTasks()
    }, [])

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={10}
            >
                <View style={styles.header}>
                    <Text style={[styles.welcome, { color: colors.text }]}>
                        {t("welcomeUser") || "Bem-vindo ao Gerenciador de Tarefas!"}
                    </Text>
                    
                    {/* Frase Motivacional do TanStack Query */}
                    {quoteLoading ? (
                        <ActivityIndicator size="small" />
                    ) : quote ? (
                        <View style={styles.quoteContainer}>
                            <Text style={[styles.quote, { color: colors.text }]}>
                                "{quote.text}"
                            </Text>
                            <Text style={[styles.author, { color: colors.text }]}>
                                - {quote.author}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.buttonContainer}>
                    <Button title={t("logout") || "Sair"} onPress={realizarLogoff} />
                    <Button title={t("deleteAccount") || "Excluir"} color='red' onPress={excluirConta} />
                    <Button title={t("changePassword") || "Alterar Senha"} color='orange' onPress={() => router.push('/AlterarSenhaScreen')} />
                </View>

                {/* Lista de Tarefas */}
                {listaTasks.length <= 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            {t("noTasks") || "Nenhuma tarefa encontrada"}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={listaTasks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TaskItem
                                title={item.title}
                                description={item.description}
                                id={item.id}
                                completed={item.completed}
                                dueDate={item.dueDate}
                                onTaskUpdate={buscarTasks}
                            />
                        )}
                        style={styles.taskList}
                    />
                )}

                {/* Formulário para Nova Tarefa */}
                <View style={styles.taskForm}>
                    <TextInput
                        placeholder={t("taskTitle") || "Título da tarefa"}
                        style={[styles.input, { color: colors.text }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={colors.text}
                    />
                    <TextInput
                        placeholder={t("taskDescription") || "Descrição"}
                        style={[styles.input, { color: colors.text }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor={colors.text}
                        multiline
                        numberOfLines={2}
                    />
                    <Text style={[styles.dateButton, { color: colors.text }]}>
                        {t("dueDate") || "Data"}: {dueDate.toLocaleDateString()}
                    </Text>
                    
                    <Button title={t("addTask") || "Adicionar Tarefa"} onPress={salvarTask} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginVertical: 20,
    },
    welcome: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    quoteContainer: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginBottom: 10,
    },
    quote: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    author: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    taskList: {
        flex: 1,
        marginBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    taskForm: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'lightgray',
        padding: 15,
        fontSize: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    dateButton: {
        padding: 15,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        marginBottom: 10,
    },
});


// import { Text, Button, Alert, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import TaskItem from "../src/components/TaskItem";
// import { useEffect, useState } from "react";
// import { auth } from '../src/services/firebaseConfig'
// import { deleteUser } from "firebase/auth";
// import { db } from "../src/services/firebaseConfig";
// import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
// import { useTheme } from "../src/context/ThemeContext";
// import { useTranslation } from 'react-i18next';
// import * as Notifications from "expo-notifications"
// import { useMotivationalQuote } from '../src/services/api';
// //import DateTimePicker from '@react-native-community/datetimepicker';
// import { DateTriggerInput } from 'expo-notifications/build/Notifications.types';


// const [dueDate, setDueDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Amanhã

// // Configuração global da notificação
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,  // adicionado
//     shouldShowList: true     // adicionado
//   })
// });


// interface Task {
//     id: string,
//     title: string,
//     description: string,
//     completed: boolean,
//     dueDate: string,
//     createdAt: any,
//     updatedAt: any,
//     userId: string
// }

// export default function HomeScreen() {
//     const { colors } = useTheme()
//     const { t } = useTranslation()
//     const [title, setTitle] = useState('')
//     const [description, setDescription] = useState('')
//     const [dueDate, setDueDate] = useState(new Date())
//     const [showDatePicker, setShowDatePicker] = useState(false)
//     const router = useRouter()
//     const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
//     const [listaTasks, setListaTasks] = useState<Task[]>([])

//     // Hook do TanStack Query para frase motivacional
//     const { data: quote, isLoading: quoteLoading, refetch: refetchQuote } = useMotivationalQuote();

//     const buscarTasks = async () => {
//         try {
//             const user = auth.currentUser
//             if (!user) return

//             const q = query(
//                 collection(db, 'tasks'),
//                 where('userId', '==', user.uid),
//                 orderBy('createdAt', 'desc')
//             );
            
//             const querySnapshot = await getDocs(q);
//             const tasks: Task[] = []

//             querySnapshot.forEach((doc) => {
//                 tasks.push({
//                     ...doc.data(),
//                     id: doc.id
//                 } as Task)
//             })

//             setListaTasks(tasks)
//         } catch (e) {
//             console.log("Error ao buscar as tasks:", e)
//         }
//     }

//     const salvarTask = async () => {
//         if (!title.trim()) {
//             Alert.alert("Atenção", "Digite o título da tarefa")
//             return
//         }

//         try {
//             const user = auth.currentUser
//             if (!user) {
//                 Alert.alert("Erro", "Usuário não logado")
//                 return
//             }

//             await addDoc(collection(db, 'tasks'), {
//                 title: title,
//                 description: description,
//                 completed: false,
//                 dueDate: dueDate.toISOString(),
//                 createdAt: Timestamp.now(),
//                 updatedAt: Timestamp.now(),
//                 userId: user.uid
//             })

//             // Agendar notificação se a data de vencimento for futura
//             if (dueDate.getTime() > Date.now()) {
//                 await agendarNotificacao(title, dueDate)
//             }

//             Alert.alert("Sucesso", "Tarefa criada com sucesso.")
//             setTitle('')
//             setDescription('')
//             setDueDate(new Date())
//             buscarTasks()
//         } catch (e) {
//             console.log("Error ao criar a tarefa:", e)
//             Alert.alert("Erro", "Erro ao criar tarefa")
//         }
//     }


//     const agendarNotificacao = async (taskTitle: string, taskDueDate: Date) => {
//         const notificationTime = new Date(taskDueDate.getTime() - 30 * 60 * 1000);
      
//         if (notificationTime.getTime() > Date.now()) {
//           await Notifications.scheduleNotificationAsync({
//             content: {
//               title: t("taskReminder"),
//               body: `${t("task")} "${taskTitle}" ${t("dueIn30Min")}`,
//             },
//             trigger: {
//               type: 'date',
//               date: notificationTime,
//             } as any, // ✅ casting para ignorar erro de TS
//           });
//         }
//       };

      
    
//     const excluirConta = () => {
//         Alert.alert("CONFIRMAR EXCLUSÃO", "Tem certeza que deseja excluir a conta? Esta ação não poderá ser desfeita.",
//             [
//                 { text: "Cancelar", style: 'cancel' },
//                 {
//                     text: "Excluir", style: 'destructive',
//                     onPress: async () => {
//                         try {
//                             const user = auth.currentUser
//                             if (user) {
//                                 await deleteUser(user)
//                                 await AsyncStorage.removeItem('@user')
//                                 Alert.alert("Conta Excluída", "Conta excluída com sucesso.")
//                                 router.push('/')
//                             }
//                         } catch (error) {
//                             Alert.alert("Erro", "Não foi possível excluir a conta.")
//                         }
//                     }
//                 }
//             ]
//         )
//     }

//     const realizarLogoff = async () => {
//         await AsyncStorage.removeItem('@user')
//         router.replace('/')
//     }

//     const registerForPushNotificationsAsync = async (): Promise<string | null> => {
//         try {
//             const { status: existingStatus } = await Notifications.getPermissionsAsync()
//             let finalStatus = existingStatus

//             if (existingStatus !== "granted") {
//                 const { status } = await Notifications.requestPermissionsAsync()
//                 finalStatus = status
//             }

//             if (finalStatus !== 'granted') {
//                 Alert.alert('Permissão negada para notificações')
//                 return null
//             }

//             const tokenData = await Notifications.getExpoPushTokenAsync()
//             return tokenData.data
//         } catch (error) {
//             console.log("Error ao gerar token:", error)
//             return null
//         }
//     }

//     useEffect(() => {
//         (async () => {
//             const token = await registerForPushNotificationsAsync()
//             setExpoPushToken(token)
//         })()
//     }, [])

//     useEffect(() => {
//         buscarTasks()
//     }, [])

//     const onDateChange = (event: any, selectedDate?: Date) => {
//         setShowDatePicker(Platform.OS === 'ios');
//         if (selectedDate) {
//             setDueDate(selectedDate);
//         }
//     };

//     return (
//         <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//             <KeyboardAvoidingView
//                 style={styles.container}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 keyboardVerticalOffset={10}
//             >
//                 <View style={styles.header}>
//                     <Text style={[styles.welcome, { color: colors.text }]}>
//                         {t("welcomeUser")}
//                     </Text>
                    
//                     {/* Frase Motivacional do TanStack Query */}
//                     {quoteLoading ? (
//                         <ActivityIndicator size="small" />
//                     ) : quote ? (
//                         <View style={styles.quoteContainer}>
//                             <Text style={[styles.quote, { color: colors.text }]}>
//                                 "{quote.text}"
//                             </Text>
//                             <Text style={[styles.author, { color: colors.text }]}>
//                                 - {quote.author}
//                             </Text>
//                         </View>
//                     ) : null}
//                 </View>

//                 <View style={styles.buttonContainer}>
//                     <Button title={t("logout")} onPress={realizarLogoff} />
//                     <Button title={t("deleteAccount")} color='red' onPress={excluirConta} />
//                     <Button title={t("changePassword")} color='orange' onPress={() => router.push('/AlterarSenhaScreen')} />
//                 </View>

//                 {/* Lista de Tarefas */}
//                 {listaTasks.length <= 0 ? (
//                     <View style={styles.emptyContainer}>
//                         <Text style={[styles.emptyText, { color: colors.text }]}>
//                             {t("noTasks")}
//                         </Text>
//                     </View>
//                 ) : (
//                     <FlatList
//                         data={listaTasks}
//                         keyExtractor={(item) => item.id}
//                         renderItem={({ item }) => (
//                             <TaskItem
//                                 title={item.title}
//                                 description={item.description}
//                                 id={item.id}
//                                 completed={item.completed}
//                                 dueDate={item.dueDate}
//                                 onTaskUpdate={buscarTasks}
//                             />
//                         )}
//                         style={styles.taskList}
//                     />
//                 )}

//                 {/* Formulário para Nova Tarefa */}
//                 <View style={styles.taskForm}>
//                     <TextInput
//                         placeholder={t("taskTitle")}
//                         style={[styles.input, { color: colors.text }]}
//                         value={title}
//                         onChangeText={setTitle}
//                         placeholderTextColor={colors.text}
//                     />
//                     <TextInput
//                         placeholder={t("taskDescription")}
//                         style={[styles.input, { color: colors.text }]}
//                         value={description}
//                         onChangeText={setDescription}
//                         placeholderTextColor={colors.text}
//                         multiline
//                         numberOfLines={2}
//                     />

//                     <Text style={[styles.dateButton, { color: colors.text }]}>
//                         Data: {dueDate.toLocaleDateString()}
//                     </Text>

//                     {/* <Text 
//                         style={[styles.dateButton, { color: colors.text }]}
//                         onPress={() => setShowDatePicker(true)}
//                     >
//                         {t("dueDate")}: {dueDate.toLocaleDateString()}
//                     </Text> */}
                    
//                     {/* {showDatePicker && (
//                         <DateTimePicker
//                             value={dueDate}
//                             mode="datetime"
//                             display="default"
//                             onChange={onDateChange}
//                         />
//                     )} */}

                    
//                     <Button title={t("addTask")} onPress={salvarTask} />
//                 </View>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingHorizontal: 20,
//     },
//     header: {
//         marginVertical: 20,
//     },
//     welcome: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginBottom: 10,
//     },
//     quoteContainer: {
//         padding: 15,
//         borderRadius: 10,
//         backgroundColor: 'rgba(0,0,0,0.1)',
//         marginBottom: 10,
//     },
//     quote: {
//         fontSize: 14,
//         fontStyle: 'italic',
//         textAlign: 'center',
//     },
//     author: {
//         fontSize: 12,
//         textAlign: 'right',
//         marginTop: 5,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         marginBottom: 20,
//     },
//     taskList: {
//         flex: 1,
//         marginBottom: 20,
//     },
//     emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     emptyText: {
//         fontSize: 16,
//         textAlign: 'center',
//     },
//     taskForm: {
//         marginBottom: 20,
//     },
//     input: {
//         backgroundColor: 'lightgray',
//         padding: 15,
//         fontSize: 15,
//         borderRadius: 10,
//         marginBottom: 10,
//     },
//     dateButton: {
//         padding: 15,
//         textAlign: 'center',
//         backgroundColor: 'rgba(0,0,0,0.1)',
//         borderRadius: 10,
//         marginBottom: 10,
//     },
// });