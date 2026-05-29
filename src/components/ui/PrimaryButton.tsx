import { Text } from "react-native";
import { styles } from "../../styles";
import { PressScale } from "./PressScale";

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressScale style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </PressScale>
  );
}
