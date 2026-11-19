import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Habit, HabitFrequency } from "../../types/habit";

type Props = NativeStackScreenProps<RootStackParamList, "AddHabit">;

const DEFAULT_COLOR = "#3b82f6";
const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export default function AddHabitScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [frequency, setFrequency] = useState<HabitFrequency>("DAILY");

  const resolvedColor = HEX_COLOR_PATTERN.test(color.trim())
    ? color.trim()
    : DEFAULT_COLOR;

  const handleAddHabit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter a habit name.");
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: trimmedName,
      color: resolvedColor,
      frequency,
    };

    try {
      const stored = await AsyncStorage.getItem("habits");
      const habits: Habit[] = stored ? (JSON.parse(stored) as Habit[]) : [];
      const updatedHabits = [...habits, newHabit];

      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      Alert.alert("Success", "Habit added!");
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save habit:", error);
      Alert.alert("Error", "Failed to save habit.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Habit</Text>

      <TextInput
        style={styles.input}
        placeholder="Habit Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Pick a Color (Hex):</Text>
      <TextInput
        style={[
          styles.input,
          { borderLeftWidth: 6, borderLeftColor: resolvedColor },
        ]}
        value={color}
        onChangeText={setColor}
        placeholder={DEFAULT_COLOR}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Frequency:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={frequency}
          onValueChange={(value: HabitFrequency) => setFrequency(value)}
        >
          <Picker.Item label="Daily" value="DAILY" />
          <Picker.Item label="Weekly" value="WEEKLY" />
          <Picker.Item label="Monthly" value="MONTHLY" />
        </Picker>
      </View>

      <Pressable style={styles.button} onPress={handleAddHabit}>
        <Text style={styles.buttonText}>Save Habit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  label: { marginBottom: 5, fontWeight: "500" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
