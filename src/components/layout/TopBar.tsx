import { Pressable, Text, View } from "react-native";
import { styles } from "../../styles";

export function TopBar({
  title,
  left,
  right,
  onLeft,
  onRight
}: {
  title?: string;
  left?: string;
  right?: string;
  onLeft?: () => void;
  onRight?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onLeft} style={styles.topSide}>
        <Text style={styles.topIcon}>{left}</Text>
      </Pressable>
      <Text style={styles.topTitle}>{title}</Text>
      <Pressable onPress={onRight} style={styles.topSide}>
        <Text style={styles.topRight}>{right}</Text>
      </Pressable>
    </View>
  );
}
