import { Text } from "react-native";
import { styles } from "../../styles";
import { PressScale } from "./PressScale";

export function FloatingButton({ onPress }: { onPress: () => void }) {
  return (
    <PressScale style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </PressScale>
  );
}
