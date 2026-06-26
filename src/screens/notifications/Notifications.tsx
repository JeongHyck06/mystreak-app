import { Pressable, ScrollView, Text, View } from "react-native";
import { useMemo, useState } from "react";
import type { AppNotification } from "../../api";
import { NotificationItem, TopBar } from "../../components";
import { styles } from "../../styles";

const FILTERS = [
  { label: "전체", type: "all" },
  { label: "체크", type: "check" },
  { label: "좋아요", type: "like" },
  { label: "댓글", type: "comment" }
] as const;

type NotificationFilter = (typeof FILTERS)[number]["type"];

export function Notifications({
  notifications,
  onBack,
  onMarkAllRead,
  onClearRead
}: {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onClearRead: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const filteredNotifications = useMemo(
    () => notifications.filter((item) => activeFilter === "all" || item.type === activeFilter),
    [activeFilter, notifications]
  );
  const unread = filteredNotifications.filter((item) => !item.read);
  const read = filteredNotifications.filter((item) => item.read);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="알림" left="‹" right="모두 읽음" onLeft={onBack} onRight={onMarkAllRead} />
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.type}
            style={[styles.filterChip, activeFilter === filter.type && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.type)}
            accessibilityRole="button"
          >
            <Text style={[styles.filterText, activeFilter === filter.type && styles.filterTextActive]}>{filter.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sectionCaption}>읽지 않은 알림</Text>
      {unread.length > 0 ? unread.map((item) => <NotificationItem key={item.id} item={item} />) : (
        <Text style={styles.bodyCopy}>새 알림이 없습니다.</Text>
      )}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionCaption}>읽은 알림</Text>
        {read.length > 0 ? (
          <Pressable onPress={onClearRead} hitSlop={8} accessibilityRole="button">
            <Text style={styles.accentText}>지우기</Text>
          </Pressable>
        ) : null}
      </View>
      {read.length > 0 ? read.map((item) => <NotificationItem key={item.id} item={item} />) : (
        <Text style={styles.bodyCopy}>읽은 알림이 없습니다.</Text>
      )}
    </ScrollView>
  );
}
