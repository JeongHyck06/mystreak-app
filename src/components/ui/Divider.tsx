import { Text, View } from "react-native";
import { styles } from "../../styles";

export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.caption}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}
