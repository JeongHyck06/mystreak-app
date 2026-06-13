import { Text, View } from "react-native";
import type { AppNotification } from "../../api";
import { styles } from "../../styles";

export function NotificationItem({ item }: { item: AppNotification }) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.smallAvatar}>
        <Text style={styles.doneMini}>✓</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.caption}>{item.body}</Text>
        <Text style={styles.caption}>{item.meta}</Text>
      </View>
    </View>
  );
}
