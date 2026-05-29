import { Platform } from "react-native";

export const colors = {
  primary: "#7bcb8d",
  primaryLight: "#dff5e4",
  secondary: "#a9ddb5",
  accent: "#4caf6a",
  success: "#2e9d58",
  background: "#f5faf5",
  surface: "#ffffff",
  border: "#e3efe4",
  mutedBorder: "#edf1ed",
  text: "#1b1d1f",
  secondaryText: "#66706a",
  subtleText: "#8c968f",
  danger: "#ff5c5c",
  dark: "#1c1f22",
  overlay: "#89958c"
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999
};

export const shadow =
  Platform.OS === "web"
    ? {
        boxShadow: "0 10px 18px rgba(17, 59, 31, 0.06)"
      }
    : {
        shadowColor: "#113b1f",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 2
      };
