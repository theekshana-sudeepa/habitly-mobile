import React from "react";
import { StatusBar } from "expo-status-bar";
import { AlertNotificationRoot } from "react-native-alert-notification";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AlertNotificationRoot>
      <StatusBar style="auto" />
      <AppNavigator />
    </AlertNotificationRoot>
  );
}
