import { ScrollView, Text, View } from "react-native";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function JoinPod({ onBack, onJoin }: { onBack: () => void; onJoin: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="팟 가입" left="‹" onLeft={onBack} />
      <Text style={styles.pageTitle}>초대링크 또는 아이디로{`\n`}참여할 팟을 찾아보세요</Text>
      <View style={styles.joinDivider} />
      <LabeledInput label="초대링크 입력" value="mystreak.app/join/ABC123" />
      <View style={styles.joinCard}>
        <View style={styles.row}>
          <View style={styles.podAvatarLarge} />
          <View style={styles.flex}>
            <Text style={styles.title}>새벽 5시 러닝 크루</Text>
            <Text style={styles.caption}>8명 참여 중 · 평균 스트릭 27일</Text>
          </View>
        </View>
        <Text style={styles.secondaryText}>
          아침 5시, 함께 달립니다. 날씨에 구애받지 말고 우선 나가세요.
        </Text>
        <Text style={styles.tagLine}>#러닝  #새벽기상  #운동</Text>
      </View>
      <View style={styles.spacer} />
      <PrimaryButton label="이 팟 가입하기" onPress={onJoin} />
    </ScrollView>
  );
}
