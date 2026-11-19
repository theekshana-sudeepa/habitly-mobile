import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProgressChart } from "react-native-chart-kit";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Habit, HabitLog } from "../../types/habit";

type Props = NativeStackScreenProps<RootStackParamList, "HabitDetail">;
type ProgressTab = "WEEKLY" | "MONTHLY" | "ALL";

const TABS: ProgressTab[] = ["WEEKLY", "MONTHLY", "ALL"];

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<ProgressTab>("WEEKLY");

  const loadHabit = useCallback(async () => {
    try {
      const [storedHabits, storedLogs] = await Promise.all([
        AsyncStorage.getItem("habits"),
        AsyncStorage.getItem(`logs_${habitId}`),
      ]);

      if (storedHabits) {
        const habits = JSON.parse(storedHabits) as Habit[];
        const found = habits.find((h) => h.id === habitId);
        setHabit(found ?? null);
      }

      setLogs(storedLogs ? (JSON.parse(storedLogs) as HabitLog[]) : []);
    } catch (error) {
      console.error("Failed to load habit details:", error);
    }
  }, [habitId]);

  useEffect(() => {
    loadHabit();
    const unsubscribe = navigation.addListener("focus", loadHabit);
    return unsubscribe;
  }, [navigation, loadHabit]);

  const today = new Date().toISOString().split("T")[0];

  const toggleCompletion = async () => {
    const existingLogIndex = logs.findIndex((log) => log.date === today);
    const updatedLogs: HabitLog[] =
      existingLogIndex >= 0
        ? logs.map((log, index) =>
            index === existingLogIndex
              ? { ...log, completed: !log.completed }
              : log
          )
        : [...logs, { date: today, completed: true }];

    setLogs(updatedLogs);
    await AsyncStorage.setItem(`logs_${habitId}`, JSON.stringify(updatedLogs));
  };

  const getCompletionRate = (days?: number): number => {
    if (logs.length === 0) return 0;

    let filtered: HabitLog[] = logs;

    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (days - 1));
      cutoff.setHours(0, 0, 0, 0);
      filtered = logs.filter((log) => new Date(log.date) >= cutoff);
    }

    if (filtered.length === 0) return 0;

    const completed = filtered.filter((log) => log.completed).length;
    return completed / filtered.length;
  };

  let progress = 0;
  if (selectedTab === "WEEKLY") progress = getCompletionRate(7);
  else if (selectedTab === "MONTHLY") progress = getCompletionRate(30);
  else progress = getCompletionRate();

  const chartData = {
    labels: [selectedTab],
    data: [progress],
  };

  const renderLog = ({ item }: { item: HabitLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logDate}>{item.date}</Text>
      <Text
        style={[
          styles.logStatus,
          { color: item.completed ? "#16a34a" : "#dc2626" },
        ]}
      >
        {item.completed ? "Completed" : "Missed"}
      </Text>
    </View>
  );

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Habit not found!</Text>
      </View>
    );
  }

  const todayLog = logs.find((l) => l.date === today);
  const todayCompleted = todayLog?.completed ?? false;

  return (
    <View style={styles.container}>
      <View style={[styles.habitCard, { borderLeftColor: habit.color }]}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.habitFrequency}>{habit.frequency}</Text>
      </View>

      <Pressable
        style={[
          styles.toggleButton,
          { backgroundColor: todayCompleted ? "#ef4444" : "#16a34a" },
        ]}
        onPress={toggleCompletion}
      >
        <Text style={styles.toggleText}>
          {todayCompleted ? "Mark Incomplete" : "Mark Complete"}
        </Text>
      </Pressable>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ProgressChart
        data={chartData}
        width={Dimensions.get("window").width - 40}
        height={200}
        strokeWidth={12}
        radius={40}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: () => "#333",
        }}
        hideLegend={false}
      />

      <Text style={styles.logsTitle}>History</Text>
      <FlatList
        data={[...logs].reverse()}
        keyExtractor={(item) => item.date}
        renderItem={renderLog}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No logs yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  habitCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderLeftWidth: 6,
    backgroundColor: "#f9f9f9",
  },
  habitName: { fontSize: 22, fontWeight: "700" },
  habitFrequency: { fontSize: 16, color: "#555" },
  toggleButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  toggleText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeTab: {
    backgroundColor: "#3b82f6",
  },
  tabText: { fontWeight: "600", color: "#333" },
  activeTabText: { color: "#fff" },
  logsTitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginBottom: 8,
  },
  logDate: { fontSize: 16 },
  logStatus: { fontSize: 16, fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },
});
