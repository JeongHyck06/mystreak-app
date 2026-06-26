import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { resolveMediaUrl, type Pod } from "../../api";
import { styles } from "../../styles";
import { TopBar } from "../../components";

export function PodManagement({
  pods,
  onBack,
  onOpenPod,
  onLeavePod
}: {
  pods: Pod[];
  onBack: () => void;
  onOpenPod: (podId: string) => void;
  onLeavePod: (podId: string) => void;
}) {
  const confirmLeave = (pod: Pod) => {
    Alert.alert(
      "팟 나가기",
      `'${pod.name}' 팟에서 나가시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { text: "나가기", style: "destructive", onPress: () => onLeavePod(pod.id) }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="참여 팟 관리" left="‹" onLeft={onBack} />
      <Text style={styles.pageTitle}>참여 중인 팟을{`\n`}관리해요</Text>
      <Text style={styles.bodyCopy}>팟별 현황을 확인하고 상세 화면으로 바로 이동할 수 있어요.</Text>
      {pods.map((pod) => {
        const avatarUrl = resolveMediaUrl(pod.avatarUrl);

        return (
          <View style={styles.managePodCard} key={pod.id}>
            <View style={styles.row}>
              <View style={styles.podAvatarLarge}>
                {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.podImageFill} /> : null}
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{pod.name}</Text>
                <Text style={styles.caption}>
                  오늘 {pod.certifiedToday}명 인증 · {pod.streak}일째
                </Text>
              </View>
            </View>
            <View style={styles.rowBetween}>
              <Pressable style={styles.softButton} onPress={() => onOpenPod(pod.id)}>
                <Text style={styles.softButtonText}>상세 보기</Text>
              </Pressable>
              <Pressable onPress={() => confirmLeave(pod)}>
                <Text style={styles.manageDangerText}>나가기</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
