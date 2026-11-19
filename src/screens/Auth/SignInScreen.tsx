import React, { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { API_ENDPOINTS } from "../../config/api";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Missing Fields",
        textBody: "Please enter both username and password.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.signIn, {
        method: "POST",
        body: JSON.stringify({
          username: trimmedUsername,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Server Error",
          textBody: "Unable to sign in right now. Please try again.",
        });
        return;
      }

      const json = await response.json();
      if (json.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Login Successful",
        });
        await AsyncStorage.setItem("user", JSON.stringify(json["Logged User"]));
        navigation.replace("Home");
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Failed",
          textBody: json.message || "Invalid credentials.",
        });
      }
    } catch (error) {
      console.error("SignIn error:", error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Network Error",
        textBody: "Could not reach the authentication server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={40}
      style={styles.container}
    >
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Signing In..." : "Login"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    color: "#3b82f6",
  },
});
