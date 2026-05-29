import { Text, View } from "react-native";
import { notifications } from "../../mockData";
import { styles } from "../../styles";

export function NotificationItem({ item }: { item: (typeof notifications)[number] }) {
  return (
    <View style={[styles.notificationCard, item.urgent && styles.notificationUrgent]}>
      <View style={styles.smallAvatar}>
        {!item.urgent && <Text style={styles.doneMini}>✓</Text>}
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.caption}>{item.body}</Text>
        <Text style={styles.caption}>{item.meta}</Text>
      </View>
      {item.urgent ? <View style={styles.redDot} /> : null}
    </View>
  );
}
