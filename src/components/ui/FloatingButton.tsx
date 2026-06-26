import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../styles";
import { PressScale } from "./PressScale";

export function FloatingButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "android" ? 48 : 18);

  return (
    <PressScale style={[styles.fab, { bottom: 68 + bottomPadding + 16 }]} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </PressScale>
  );
}
