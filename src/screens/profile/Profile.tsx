import { Pressable, ScrollView, Text, View } from "react-native";
import { BottomTabs, SectionHeader, StatCard } from "../../components";
import type { Pod, Profile as ProfileData } from "../../api";
import type { Tab } from "../../navigation";
import { styles } from "../../styles";

export function Profile({
  profile,
  pods,
  onEdit,
  onManage,
  onLogout,
  onTab
}: {
  profile: ProfileData | null;
  pods: Pod[];
  onEdit: () => void;
  onManage: () => void;
  onLogout: () => void;
  onTab: (tab: Tab) => void;
}) {
  const currentStreak = profile?.currentStreak ?? 0;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.screenWithTab}>
        <Text style={styles.pageTitle}>프로필</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar} />
          <View style={styles.flex}>
            <Text style={styles.profileName}>{profile?.name || "프로필 이름 없음"}</Text>
            <Text style={styles.secondaryText}>{profile?.handle || "@handle"}</Text>
            <Text style={styles.secondaryText}>{currentStreak}일째 스트릭 도전중</Text>
          </View>
          <Pressable style={styles.softButton} onPress={onEdit}>
            <Text style={styles.softButtonText}>프로필 편집</Text>
          </Pressable>
          <Text style={styles.profileBio}>{profile?.bio || "한 줄 소개를 등록해 주세요."}</Text>
        </View>
        <View style={styles.statsRow}>
          <StatCard label="참여 팟" value={`${pods.length}`} />
          <StatCard label="누적 인증" value={`${profile?.totalChecks ?? 0}`} />
          <StatCard label="얻은 트로피 수" value={`${profile?.trophies ?? 0}`} />
        </View>
        <SectionHeader title="참여 중인 팟" action="관리 ›" onAction={onManage} />
        <View style={styles.profilePods}>
          {pods.map((pod) => (
            <View style={styles.profilePodTile} key={pod.id}>
              <Text style={styles.cardTitle}>{pod.name.replace(" 크루", "")}</Text>
              <Text style={styles.accentText}>{pod.streak}일째</Text>
            </View>
          ))}
        </View>
        <Text style={styles.title}>설정</Text>
        <View style={styles.settingsCard}>
          {["알림 설정", "개인정보 · 데이터", "도움말 · 문의하기"].map((label) => (
            <View style={styles.settingRow} key={label}>
              <Text style={styles.bodyText}>{label}</Text>
              <Text style={styles.caption}>›</Text>
            </View>
          ))}
          <Pressable onPress={onLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomTabs active="profile" onTab={onTab} />
    </View>
  );
}
