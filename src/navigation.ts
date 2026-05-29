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
  | "editProfile";

export type Tab = "home" | "pod" | "stats" | "profile";

export const tabScreens: Record<Tab, Screen> = {
  home: "home",
  pod: "pod",
  stats: "stats",
  profile: "profile"
};
