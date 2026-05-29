import { ScrollView, Text, View } from "react-native";
import { BottomTabs, HeatCell } from "../../components";
import { heatmap } from "../../mockData";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";

export function Stats({ onTab }: { onTab: (tab: Tab) => void }) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.screenWithTab}>
        <View style={styles.rowBetween}>
          <Text style={styles.pageTitle}>나의 스트릭</Text>
          <View style={styles.monthPill}>
            <Text style={styles.cardTitle}>‹ 2026년 5월 ›</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statLarge, styles.statLargeGreen]}>
            <Text style={styles.heroLabel}>현재 스트릭</Text>
            <View style={styles.rowEnd}>
              <Text style={styles.largeNumber}>27</Text>
              <Text style={styles.heroLabel}>일</Text>
            </View>
            <Text style={styles.heroLabel}>개인 신기록 달성이에요</Text>
          </View>
          <View style={styles.statLarge}>
            <Text style={styles.caption}>최대 스트릭</Text>
            <View style={styles.rowEnd}>
              <Text style={styles.largeNumberDark}>42</Text>
              <Text style={styles.cardTitle}>일</Text>
            </View>
            <Text style={styles.caption}>2025년 12월 기록</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.caption}>이번 달 인증 달성률</Text>
              <Text style={styles.percent}>87%</Text>
              <Text style={styles.accentText}>지난 달보다 +12%, 지금의 흐름 좋아요!</Text>
            </View>
            <View style={styles.ring}>
              <Text style={styles.ringText}>26일</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>5월 인증 히트맵</Text>
          <Text style={styles.caption}>높은 톤은 더 많은 인증, 회색은 비워있는 날</Text>
          <View style={styles.heatmap}>
            {heatmap.map((level, index) => (
              <HeatCell key={index} level={level} index={index} />
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.caption}>최근 얻은 트로피</Text>
          <Text style={styles.title}>연속 3주 완주 클럽하우스</Text>
          <Text style={styles.caption}>새벽 5시 러닝 크루 팟에서 획득 · 3일 전</Text>
        </View>
      </ScrollView>
      <BottomTabs active="stats" onTab={onTab} />
    </View>
  );
}
