import { StyleSheet, View, Text, Pressable } from "react-native";
import { Octicons, MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from "react";
import { doc, updateDoc, db, deleteDoc, Timestamp } from '../services/firebaseConfig'
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from 'react-i18next';

interface TaskItemProps {
    title: string;
    description: string;
    id: string;
    completed: boolean;
    dueDate: string;
    onTaskUpdate: () => void;
}

export default function TaskItem(props: TaskItemProps) {
    const [completed, setCompleted] = useState(props.completed)
    const { colors } = useTheme()
    const { t } = useTranslation()

    const updateTask = async () => {
        const taskRef = doc(db, 'tasks', props.id)
        
        await updateDoc(taskRef, {
            completed: completed,
            updatedAt: Timestamp.now()
        })
    }

    const deleteTask = async () => {
        await deleteDoc(doc(db, 'tasks', props.id));
        props.onTaskUpdate()
    }

    useEffect(() => {
        updateTask()
    }, [completed])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }

    const isOverdue = () => {
        const now = new Date()
        const due = new Date(props.dueDate)
        return due < now && !completed
    }

    return (
        <View style={[
            styles.container, 
            { backgroundColor: colors.background === '#fff' ? 'lightgray' : '#333' },
            isOverdue() && styles.overdue
        ]}>
            <Pressable onPress={() => setCompleted(!completed)}>
                {completed ? (
                    <Octicons name="check-circle-fill" color={colors.text} size={24} />
                ) : (
                    <Octicons name="check-circle" color={colors.text} size={24} />
                )}
            </Pressable>
            
            <View style={styles.taskContent}>
                <Text style={[
                    styles.title, 
                    { color: colors.text },
                    completed && styles.completed
                ]}>
                    {props.title}
                </Text>
                {props.description ? (
                    <Text style={[
                        styles.description, 
                        { color: colors.text },
                        completed && styles.completed
                    ]}>
                        {props.description}
                    </Text>
                ) : null}
                <Text style={[styles.dueDate, { color: colors.text }]}>
                    {t("dueDate")}: {formatDate(props.dueDate)}
                </Text>
            </View>
            
            <Pressable onPress={deleteTask}>
                <MaterialIcons name='delete' color={colors.text} size={24} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    overdue: {
        borderLeftWidth: 4,
        borderLeftColor: 'red',
    },
    taskContent: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 4,
    },
    dueDate: {
        fontSize: 12,
        opacity: 0.7,
    },
    completed: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    }
})