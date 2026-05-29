import { ScrollView, Text, View } from "react-native";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function CreatePod({ onClose }: { onClose: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="×" right="다음" onLeft={onClose} onRight={onClose} />
      <Text style={styles.sectionCaption}>팟 기본 정보</Text>
      <LabeledInput label="팟 이름" value="새벽 러닝 크루" active />
      <LabeledInput label="소개" value="팟을 짧게 소개해 주세요. 최대 100자" multiline />
      <Text style={styles.cardTitle}>최대 인원</Text>
      <View style={styles.counterRow}>
        <View style={styles.roundLight}>
          <Text style={styles.accentText}>−</Text>
        </View>
        <View style={styles.roundGreen}>
          <Text style={styles.socialLight}>+</Text>
        </View>
      </View>
      <View style={styles.previewCard}>
        <Text style={styles.accentText}>미리보기</Text>
        <View style={styles.row}>
          <View style={styles.previewDot} />
          <View>
            <Text style={styles.cardTitle}>새벽 러닝 크루</Text>
            <Text style={styles.caption}>운동 · 사진 인증 · 최대 8명</Text>
          </View>
        </View>
      </View>
      <View style={styles.spacer} />
      <PrimaryButton label="다음 단계로" onPress={onClose} />
    </ScrollView>
  );
}
