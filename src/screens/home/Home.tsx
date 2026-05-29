import { Pressable, ScrollView, Text, View } from "react-native";
import { AnimatedProgress, BottomTabs, FloatingButton, PodCard, SectionHeader, StatCard } from "../../components";
import { pods } from "../../mockData";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";

export function Home({
  onOpenNotifications,
  onOpenPod,
  onUpload,
  onAddPod,
  onTab
}: {
  onOpenNotifications: () => void;
  onOpenPod: (podId: string) => void;
  onUpload: () => void;
  onAddPod: () => void;
  onTab: (tab: Tab) => void;
}) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.screenWithTab}>
        <View style={styles.homeHeader}>
          <View style={styles.avatar} />
          <View style={styles.flex}>
            <Text style={styles.caption}>안녕하세요</Text>
            <Text style={styles.headerName}>다혜님, 오늘도 화이팅!</Text>
          </View>
          <Pressable style={styles.bellButton} onPress={onOpenNotifications}>
            <Text style={styles.bellText}>•</Text>
          </Pressable>
        </View>
        <Pressable style={styles.streakHero} onPress={() => onTab("stats")}>
          <View style={styles.rowBetween}>
            <Text style={styles.heroLabel}>오늘의 스트릭</Text>
            <View style={styles.badgeDark}>
              <Text style={styles.badgeDarkText}>연속 4주차</Text>
            </View>
          </View>
          <Text style={styles.heroDays}>27일째</Text>
          <Text style={styles.heroLabel}>개인 최고 기록 30일까지 3일 남았어요!</Text>
          <View style={styles.progressTrack}>
            <AnimatedProgress progress={0.9} />
          </View>
        </Pressable>
        <View style={styles.statsRow}>
          <StatCard label="이번 주 인증" value="6" unit="/ 7일" />
          <StatCard label="누적 인증" value="146" unit="회" />
          <StatCard label="참여 팟" value="3" unit="개 활동 중" />
        </View>
        <SectionHeader title="현재 참여중인 팟" action="전체 보기" onAction={() => onTab("pod")} />
        {pods.map((pod) => (
          <PodCard key={pod.id} pod={pod} onPress={() => onOpenPod(pod.id)} onUpload={onUpload} />
        ))}
      </ScrollView>
      <FloatingButton onPress={onAddPod} />
      <BottomTabs active="home" onTab={onTab} />
    </View>
  );
}
