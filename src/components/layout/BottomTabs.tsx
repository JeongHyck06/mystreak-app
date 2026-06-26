import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";
import { PressScale } from "../ui/PressScale";

export function BottomTabs({ active, onTab }: { active: Tab; onTab: (tab: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "android" ? 48 : 18);
  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "홈" },
    { id: "pod", label: "팟" },
    { id: "stats", label: "스트릭" },
    { id: "profile", label: "프로필" }
  ];

  return (
    <View style={[styles.tabBar, { height: 68 + bottomPadding, paddingBottom: bottomPadding }]}>
      {tabs.map((tab) => (
        <PressScale key={tab.id} style={styles.tabItem} onPress={() => onTab(tab.id)}>
          <Text style={[styles.tabText, active === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </PressScale>
      ))}
    </View>
  );
}
