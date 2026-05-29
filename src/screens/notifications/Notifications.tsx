import { ScrollView, Text, View } from "react-native";
import { NotificationItem, TopBar } from "../../components";
import { notifications } from "../../mockData";
import { styles } from "../../styles";

export function Notifications({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="알림" left="‹" right="모두 읽음" onLeft={onBack} />
      <View style={styles.filterRow}>
        {["전체", "체크", "댓글", "스트릭 마감"].map((filter, index) => (
          <View key={filter} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
            <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionCaption}>오늘</Text>
      {notifications.slice(0, 3).map((item) => <NotificationItem key={item.id} item={item} />)}
      <Text style={styles.sectionCaption}>이번 주</Text>
      {notifications.slice(3).map((item) => <NotificationItem key={item.id} item={item} />)}
    </ScrollView>
  );
}
