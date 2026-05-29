import { Text, View } from "react-native";
import type { Pod } from "../../mockData";
import { styles } from "../../styles";
import { PressScale } from "../ui/PressScale";

export function PodCard({
  pod,
  onPress,
  onUpload
}: {
  pod: Pod;
  onPress: () => void;
  onUpload: () => void;
}) {
  return (
    <PressScale style={[styles.podCard, pod.needsCheckIn && styles.podCardActive]} onPress={onPress}>
      <View style={[styles.podAvatar, pod.needsCheckIn && styles.podAvatarWhite]} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{pod.name}</Text>
        <Text style={[styles.caption, pod.needsCheckIn && styles.accentText]}>
          오늘 {pod.certifiedToday}/{pod.maxMembers}명 인증
        </Text>
        <Text style={pod.needsCheckIn ? styles.caption : styles.accentText}>
          {pod.needsCheckIn ? "자정까지 6시간 남음" : `${pod.streak}일째 이어지는 중`}
        </Text>
      </View>
      {pod.needsCheckIn ? (
        <PressScale style={styles.smallCta} onPress={onUpload}>
          <Text style={styles.smallCtaText}>인증하기</Text>
        </PressScale>
      ) : (
        <View style={styles.doneCircle}>
          <Text style={styles.doneText}>✓</Text>
        </View>
      )}
    </PressScale>
  );
}
