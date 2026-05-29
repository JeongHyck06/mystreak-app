import { ScrollView, Text, View } from "react-native";
import type { AppNotification } from "../../api";
import { NotificationItem, TopBar } from "../../components";
import { styles } from "../../styles";

export function Notifications({
  notifications,
  onBack,
  onMarkAllRead
}: {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const unread = notifications.filter((item) => !item.read);
  const read = notifications.filter((item) => item.read);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="알림" left="‹" right="모두 읽음" onLeft={onBack} onRight={onMarkAllRead} />
      <View style={styles.filterRow}>
        {["전체", "체크", "댓글", "스트릭 마감"].map((filter, index) => (
          <View key={filter} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
            <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionCaption}>읽지 않은 알림</Text>
      {unread.length > 0 ? unread.map((item) => <NotificationItem key={item.id} item={item} />) : (
        <Text style={styles.bodyCopy}>새 알림이 없습니다.</Text>
      )}
      <Text style={styles.sectionCaption}>읽은 알림</Text>
      {read.map((item) => <NotificationItem key={item.id} item={item} />)}
    </ScrollView>
  );
}
