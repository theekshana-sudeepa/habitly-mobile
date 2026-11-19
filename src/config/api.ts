const rawBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || "http://localhost:8080";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  signIn: `${API_BASE_URL}/HabitlyBackend/SignIn`,
  signUp: `${API_BASE_URL}/HabitlyBackend/SignUp`,
} as const;
