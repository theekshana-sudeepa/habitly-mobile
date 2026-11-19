import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { UserProfile } from "../../types/habit";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ route, navigation }: Props) {
  const [user, setUser] = useState<UserProfile | null>(
    route.params?.user ?? null
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored) as UserProfile);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" }],
    });
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={
              user.profileImage
                ? { uri: user.profileImage }
                : require("../../../assets/profile.png")
            }
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#3b82f6",
    borderRadius: 75,
    overflow: "hidden",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    color: "#555",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    width: "90%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
