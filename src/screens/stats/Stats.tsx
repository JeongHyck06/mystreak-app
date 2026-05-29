import { Pressable, ScrollView, Text, View } from "react-native";
import { BottomTabs, HeatCell } from "../../components";
import type { Stats as StatsData } from "../../api";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";

export function Stats({
  stats,
  onTab,
  onPreviousMonth,
  onNextMonth
}: {
  stats: StatsData | null;
  onTab: (tab: Tab) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}) {
  const heatmap = stats?.heatmap ?? [];
  const year = stats?.year ?? new Date().getFullYear();
  const month = stats?.month ?? new Date().getMonth() + 1;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.screenWithTab}>
        <View style={styles.rowBetween}>
          <Text style={styles.pageTitle}>나의 스트릭</Text>
          <View style={styles.monthPill}>
            <Pressable onPress={onPreviousMonth} hitSlop={10} accessibilityLabel="이전 달">
              <Text style={styles.monthArrow}>‹</Text>
            </Pressable>
            <Text style={styles.cardTitle}>
              {year}년 {month}월
            </Text>
            <Pressable onPress={onNextMonth} hitSlop={10} accessibilityLabel="다음 달">
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statLarge, styles.statLargeGreen]}>
            <Text style={styles.heroLabel}>현재 스트릭</Text>
            <View style={styles.rowEnd}>
                <Text style={styles.largeNumber}>{stats?.currentStreak ?? 0}</Text>
              <Text style={styles.heroLabel}>일</Text>
            </View>
            <Text style={styles.heroLabel}>개인 신기록 달성이에요</Text>
          </View>
          <View style={styles.statLarge}>
            <Text style={styles.caption}>최대 스트릭</Text>
            <View style={styles.rowEnd}>
              <Text style={styles.largeNumberDark}>{stats?.bestStreak ?? 0}</Text>
              <Text style={styles.cardTitle}>일</Text>
            </View>
            <Text style={styles.caption}>지금까지의 최고 기록</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.caption}>이번 달 인증 달성률</Text>
              <Text style={styles.percent}>{stats?.monthlyCompletionRate ?? 0}%</Text>
              <Text style={styles.accentText}>지금의 흐름 좋아요!</Text>
            </View>
            <View style={styles.ring}>
              <Text style={styles.ringText}>{stats?.checkedDaysInMonth ?? 0}일</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>{month}월 인증 히트맵</Text>
          <Text style={styles.caption}>높은 톤은 더 많은 인증, 회색은 비워있는 날</Text>
          <View style={styles.heatmap}>
            {heatmap.map((level, index) => (
              <HeatCell key={index} level={level} index={index} />
            ))}
            {heatmap.length === 0 ? <Text style={styles.bodyCopy}>표시할 인증 기록이 없습니다.</Text> : null}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.caption}>최근 얻은 트로피</Text>
          <Text style={styles.title}>{stats?.recentTrophy || "아직 획득한 트로피가 없습니다"}</Text>
          <Text style={styles.caption}>스트릭을 이어가면 새로운 트로피를 얻을 수 있어요.</Text>
        </View>
      </ScrollView>
      <BottomTabs active="stats" onTab={onTab} />
    </View>
  );
}
