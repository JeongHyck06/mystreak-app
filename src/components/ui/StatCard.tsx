import { Text, View } from "react-native";
import { styles } from "../../styles";

export function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.caption}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.caption}>{unit}</Text> : null}
      </View>
    </View>
  );
}
