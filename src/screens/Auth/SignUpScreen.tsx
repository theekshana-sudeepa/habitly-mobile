import React, { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { API_ENDPOINTS } from "../../config/api";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

interface UploadFilePart {
  uri: string;
  name: string;
  type: string;
}

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (
      !trimmedName ||
      !trimmedUsername ||
      !trimmedEmail ||
      !password ||
      !confirmPassword
    ) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Missing Fields",
        textBody: "Please complete all required fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Password Mismatch",
        textBody: "Password and confirmation must match.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("fullName", trimmedName);
    formData.append("email", trimmedEmail);
    formData.append("username", trimmedUsername);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    if (profileImage) {
      const filePart: UploadFilePart = {
        uri: profileImage,
        name: "profile.jpg",
        type: "image/jpeg",
      };
      formData.append("profileImage", filePart as unknown as Blob);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.signUp, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Server error while creating account.",
        });
        return;
      }

      const json = await response.json();
      if (json.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Account created successfully!",
        });
        setFullName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setProfileImage(null);
        navigation.navigate("SignIn");
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: json.message || "Failed to create account.",
        });
      }
    } catch (err) {
      console.error("SignUp error:", err);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Network Error",
        textBody: "Could not reach the registration server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Pick Profile Image</Text>
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("SignIn")}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageText: {
    color: "#888",
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
