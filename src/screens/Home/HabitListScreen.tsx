import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Habit, UserProfile } from "../../types/habit";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HabitListScreen({ navigation }: Props) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [storedHabits, storedUser] = await Promise.all([
        AsyncStorage.getItem("habits"),
        AsyncStorage.getItem("user"),
      ]);
      if (storedHabits) setHabits(JSON.parse(storedHabits) as Habit[]);
      if (storedUser) setUser(JSON.parse(storedUser) as UserProfile);
    } catch (error) {
      console.error("AsyncStorage load error:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Profile", { user })}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Profile</Text>
        </Pressable>
      ),
    });
  }, [navigation, user]);

  const renderHabit = ({ item }: { item: Habit }) => (
    <Pressable
      onPress={() => navigation.navigate("HabitDetail", { habitId: item.id })}
    >
      <View style={[styles.habitCard, { borderLeftColor: item.color }]}>
        <Text style={styles.habitName}>{item.name}</Text>
        <Text style={styles.habitFrequency}>{item.frequency}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits added yet.</Text>
        }
      />

      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Text style={styles.addButtonText}>+ Add Habit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerButton: { marginRight: 15 },
  headerButtonText: { color: "#3b82f6", fontWeight: "bold" },
  habitCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 6,
    backgroundColor: "#f9f9f9",
  },
  habitName: { fontSize: 18, fontWeight: "600" },
  habitFrequency: { color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
