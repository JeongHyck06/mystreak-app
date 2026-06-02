import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function SignUp({
  onBack,
  onSignUp,
  onOpenLogin
}: {
  onBack: () => void;
  onSignUp: (email: string, password: string, name: string, handle: string) => Promise<void>;
  onOpenLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    const normalizedHandle = handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;
    if (!/^@[a-zA-Z0-9._]{3,30}$/.test(normalizedHandle)) {
      setError("아이디는 영문/숫자 3자 이상으로 입력해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp(email.trim(), password, name.trim(), normalizedHandle);
    } catch (error) {
      setError(error instanceof Error ? error.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="‹" onLeft={onBack} />
      <Text style={styles.brand}>My Streak</Text>
      <Text style={styles.pageTitle}>계정을 만들어요</Text>
      <Text style={styles.bodyCopy}>닉네임과 아이디를 정하고 첫 스트릭을 시작하세요.</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        maxLength={30}
        placeholder="닉네임 (예: 다혜)"
      />
      <TextInput
        style={styles.input}
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
        maxLength={31}
        placeholder="아이디 (예: @doitall)"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="your@example.com"
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordDots}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="비밀번호"
        />
      </View>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordDots}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="비밀번호 확인"
        />
      </View>
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <PrimaryButton label={isSubmitting ? "처리 중..." : "회원가입"} onPress={submit} />
      <Pressable style={styles.textButton} onPress={onOpenLogin}>
        <Text style={styles.secondaryText}>이미 계정이 있어요 · 로그인</Text>
      </Pressable>
    </ScrollView>
  );
}
