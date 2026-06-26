import { Image, Text, View } from "react-native";
import { resolveMediaUrl, type Pod } from "../../api";
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
  const avatarUrl = resolveMediaUrl(pod.avatarUrl);

  return (
    <PressScale style={[styles.podCard, pod.needsCheckIn && styles.podCardActive]} onPress={onPress}>
      <View style={[styles.podAvatar, pod.needsCheckIn && styles.podAvatarWhite]}>
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.podImageFill} /> : null}
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{pod.name}</Text>
        <Text style={[styles.caption, pod.needsCheckIn && styles.accentText]}>
          오늘 {pod.certifiedToday}명 인증
        </Text>
        <Text style={pod.needsCheckIn ? styles.caption : styles.accentText}>
          {pod.needsCheckIn ? "자정까지 6시간 남음" : `${pod.streak}일째 이어지는 중`}
        </Text>
      </View>
      <PressScale style={styles.smallCta} onPress={onUpload}>
        <Text style={styles.smallCtaText}>{pod.needsCheckIn ? "인증하기" : "추가 인증"}</Text>
      </PressScale>
    </PressScale>
  );
}
