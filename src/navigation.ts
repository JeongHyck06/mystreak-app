export type Screen =
  | "onboarding"
  | "login"
  | "signup"
  | "home"
  | "pod"
  | "upload"
  | "stats"
  | "profile"
  | "notifications"
  | "podActions"
  | "managePods"
  | "createPod"
  | "invitePod"
  | "joinPod"
  | "editProfile"
  | "publicProfile";

export type Tab = "home" | "pod" | "stats" | "profile";

export const tabOrder: Tab[] = ["home", "pod", "stats", "profile"];

export const tabScreens: Record<Tab, Screen> = {
  home: "home",
  pod: "pod",
  stats: "stats",
  profile: "profile"
};
