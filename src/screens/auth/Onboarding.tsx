import { Pressable, Text, View } from "react-native";
import { AnimatedWeekBar, PrimaryButton } from "../../components";
import { styles } from "../../styles";

export function Onboarding({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  return (
    <View style={styles.onboarding}>
      <Text style={styles.brand}>My Streak</Text>
      <View style={styles.mockPhone}>
        <View style={styles.mockStatus}>
          <Text style={styles.caption}>오늘의 스트릭</Text>
          <Text style={styles.mockStatusValue}>27일째 이어지는 중</Text>
          <Text style={styles.mockDelta}>+1</Text>
        </View>
        <View style={styles.weekCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>이번 주 인증 현황</Text>
            <Text style={styles.accentText}>6/7</Text>
          </View>
          <View style={styles.weekBars}>
            {[1, 1, 1, 1, 1, 0, 0].map((done, index) => (
              <AnimatedWeekBar key={index} done={Boolean(done)} index={index} />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.pagination}>
        <View style={styles.paginationActive} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
      </View>
      <Text style={styles.heroCopy}>혼자가 아닌 함께,{`\n`}습관이 이어지는 곳</Text>
      <Text style={styles.bodyCopy}>
        매일 인증 사진을 올리고,{`\n`}같은 팟 멤버와 체크하며{`\n`}스트릭을 채워가세요.
      </Text>
      <PrimaryButton label="시작하기" onPress={onStart} />
      <Pressable onPress={onLogin} style={styles.textButton}>
        <Text style={styles.secondaryText}>이미 계정이 있어요 · 로그인</Text>
      </Pressable>
    </View>
  );
}
