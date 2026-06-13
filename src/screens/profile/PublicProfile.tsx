import { Image, ScrollView, Text, View } from "react-native";
import type { Profile } from "../../api";
import { TopBar } from "../../components";
import { styles } from "../../styles";

export function PublicProfile({
  profile,
  onBack
}: {
  profile: Profile | null;
  onBack: () => void;
}) {
  const name = profile?.name || "프로필";

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title={name} left="‹" onLeft={onBack} />
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
          ) : null}
        </View>
        <View style={[styles.flex, styles.profileInfo]}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileHandle}>{profile?.handle || "@handle"}</Text>
          <Text style={styles.profileStreakLine}>{profile?.currentStreak ?? 0}일째 스트릭 도전중</Text>
        </View>
        <Text style={styles.profileBio}>{profile?.bio || "한 줄 소개가 없습니다."}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.caption}>현재 스트릭</Text>
          <Text style={styles.statValue}>{profile?.currentStreak ?? 0}</Text>
          <Text style={styles.caption}>일째</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.caption}>최고 스트릭</Text>
          <Text style={styles.statValue}>{profile?.bestStreak ?? 0}</Text>
          <Text style={styles.caption}>일</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.caption}>트로피</Text>
          <Text style={styles.statValue}>{profile?.trophies ?? 0}</Text>
          <Text style={styles.caption}>개</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.caption}>누적 인증</Text>
        <Text style={styles.title}>{profile?.totalChecks ?? 0}회</Text>
        <Text style={styles.caption}>함께 스트릭을 이어가는 중이에요.</Text>
      </View>
    </ScrollView>
  );
}
