import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Divider, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function Login({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="‹" onLeft={onBack} />
      <Text style={styles.brand}>My Streak</Text>
      <Text style={styles.pageTitle}>만나서 반가워요!</Text>
      <Text style={styles.bodyCopy}>이메일로 로그인하고 오늘의 스트릭을 이어가세요.</Text>
      <TextInput style={styles.input} value="your@example.com" editable={false} />
      <View style={styles.passwordRow}>
        <Text style={styles.passwordDots}>••••••••••</Text>
        <Text style={styles.secondaryText}>표시</Text>
      </View>
      <Pressable style={styles.textButton}>
        <Text style={styles.accentText}>비밀번호를 잊으셨나요?</Text>
      </Pressable>
      <PrimaryButton label="로그인" onPress={onDone} />
      <Divider label="또는" />
      <Pressable style={[styles.socialButton, styles.kakaoButton]} onPress={onDone}>
        <Text style={styles.socialStrong}>카카오로 시작하기</Text>
      </Pressable>
      <Pressable style={[styles.socialButton, styles.appleButton]} onPress={onDone}>
        <Text style={styles.socialLight}>Apple로 시작하기</Text>
      </Pressable>
      <Pressable style={styles.socialButton} onPress={onDone}>
        <Text style={styles.socialStrong}>G Google로 시작하기</Text>
      </Pressable>
      <Pressable style={styles.textButton} onPress={onDone}>
        <Text style={styles.secondaryText}>처음이신가요? 회원가입하기</Text>
      </Pressable>
    </ScrollView>
  );
}
