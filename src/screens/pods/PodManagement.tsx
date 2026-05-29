import { Pressable, ScrollView, Text, View } from "react-native";
import { pods } from "../../mockData";
import { styles } from "../../styles";
import { TopBar } from "../../components";

export function PodManagement({
  onBack,
  onOpenPod
}: {
  onBack: () => void;
  onOpenPod: (podId: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="참여 팟 관리" left="‹" onLeft={onBack} />
      <Text style={styles.pageTitle}>참여 중인 팟을{`\n`}관리해요</Text>
      <Text style={styles.bodyCopy}>팟별 현황을 확인하고 상세 화면으로 바로 이동할 수 있어요.</Text>
      {pods.map((pod) => (
        <View style={styles.managePodCard} key={pod.id}>
          <View style={styles.row}>
            <View style={styles.podAvatarLarge} />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{pod.name}</Text>
              <Text style={styles.caption}>
                오늘 {pod.certifiedToday}/{pod.maxMembers}명 인증 · {pod.streak}일째
              </Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <Pressable style={styles.softButton} onPress={() => onOpenPod(pod.id)}>
              <Text style={styles.softButtonText}>상세 보기</Text>
            </Pressable>
            <Text style={styles.manageDangerText}>나가기</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
