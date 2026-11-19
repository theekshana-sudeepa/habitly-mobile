import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import SignInScreen from "../screens/Auth/SignInScreen";
import HabitListScreen from "../screens/Home/HabitListScreen";
import AddHabitScreen from "../screens/Home/AddHabitScreen";
import HabitDetailScreen from "../screens/Home/HabitDetailScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { UserProfile } from "../types/habit";

export type RootStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
  Home: undefined;
  AddHabit: undefined;
  HabitDetail: { habitId: string };
  Profile: { user?: UserProfile | null } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Sign In" }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Sign Up" }}
        />
        <Stack.Screen
          name="Home"
          component={HabitListScreen}
          options={{ title: "My Habits" }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{ title: "Add Habit" }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ title: "Habit Detail" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
