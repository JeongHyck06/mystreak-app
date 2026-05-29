import { Pressable, ScrollView, Text, View } from "react-native";
import { AnimatedProgress, BottomTabs, FloatingButton, PodCard, SectionHeader, StatCard } from "../../components";
import type { Pod, Profile, Stats } from "../../api";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";

export function Home({
  profile,
  pods,
  stats,
  onOpenNotifications,
  onOpenProfile,
  onOpenPod,
  onUpload,
  onAddPod,
  onTab
}: {
  profile: Profile | null;
  pods: Pod[];
  stats: Stats | null;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenPod: (podId: string) => void;
  onUpload: () => void;
  onAddPod: () => void;
  onTab: (tab: Tab) => void;
}) {
  const firstName = profile?.name ? `${profile.name}님` : "오늘";
  const currentStreak = stats?.currentStreak ?? profile?.currentStreak ?? 0;
  const bestStreak = stats?.bestStreak ?? profile?.bestStreak ?? 0;
  const remainingBest = Math.max(bestStreak - currentStreak, 0);
  const weeklyGoal = stats?.weeklyGoal || 7;
  const weeklyChecks = stats?.weeklyChecks ?? 0;
  const progress = weeklyGoal > 0 ? Math.min(weeklyChecks / weeklyGoal, 1) : 0;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.screenWithTab}>
        <View style={styles.homeHeader}>
          <Pressable onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel="프로필 열기">
            <View style={styles.avatar} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.caption}>안녕하세요</Text>
            <Text style={styles.headerName}>{firstName}, 오늘도 화이팅!</Text>
          </View>
          <Pressable style={styles.bellButton} onPress={onOpenNotifications}>
            <Text style={styles.bellText}>•</Text>
          </Pressable>
        </View>
        <Pressable style={styles.streakHero} onPress={() => onTab("stats")}>
          <View style={styles.rowBetween}>
            <Text style={styles.heroLabel}>오늘의 스트릭</Text>
            <View style={styles.badgeDark}>
              <Text style={styles.badgeDarkText}>이번 주 {weeklyChecks}/{weeklyGoal}</Text>
            </View>
          </View>
          <Text style={styles.heroDays}>{currentStreak}일째</Text>
          <Text style={styles.heroLabel}>
            {remainingBest > 0 ? `개인 최고 기록까지 ${remainingBest}일 남았어요!` : "개인 최고 기록 달성 중이에요!"}
          </Text>
          <View style={styles.progressTrack}>
            <AnimatedProgress progress={progress} />
          </View>
        </Pressable>
        <View style={styles.statsRow}>
          <StatCard label="이번 주 인증" value={`${weeklyChecks}`} unit={`/ ${weeklyGoal}일`} />
          <StatCard label="누적 인증" value={`${stats?.totalChecks ?? profile?.totalChecks ?? 0}`} unit="회" />
          <StatCard label="참여 팟" value={`${stats?.activePods ?? pods.length}`} unit="개 활동 중" />
        </View>
        <SectionHeader title="현재 참여중인 팟" action="전체 보기" onAction={() => onTab("pod")} />
        {pods.length > 0 ? (
          pods.map((pod) => (
            <PodCard key={pod.id} pod={pod} onPress={() => onOpenPod(pod.id)} onUpload={onUpload} />
          ))
        ) : (
          <Text style={styles.bodyCopy}>참여 중인 팟이 아직 없습니다. 새 팟을 만들거나 초대 코드로 참여해 보세요.</Text>
        )}
      </ScrollView>
      <FloatingButton onPress={onAddPod} />
      <BottomTabs active="home" onTab={onTab} />
    </View>
  );
}
