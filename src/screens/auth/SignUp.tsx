import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { sendEmailVerificationCode, verifyEmailCode } from "../../api";
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
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailVerified = verifiedEmail === normalizedEmail && normalizedEmail.length > 0;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setVerificationCode("");
    setVerifiedEmail("");
    setMessage("");
  };

  const sendCode = async () => {
    setError("");
    setMessage("");
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("인증 코드를 받을 이메일을 올바르게 입력해 주세요.");
      return;
    }

    setIsSendingCode(true);
    try {
      await sendEmailVerificationCode(normalizedEmail);
      setMessage("인증 코드를 이메일로 보냈어요. 10분 안에 입력해 주세요.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "인증 코드 전송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError("6자리 인증 코드를 입력해 주세요.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      await verifyEmailCode(normalizedEmail, verificationCode.trim());
      setVerifiedEmail(normalizedEmail);
      setMessage("이메일 인증이 완료됐어요.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "이메일 인증에 실패했습니다.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const submit = async () => {
    setError("");
    setMessage("");
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
    if (!isEmailVerified) {
      setError("이메일 인증을 완료해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp(normalizedEmail, password, name.trim(), normalizedHandle);
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
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="your@example.com"
      />
      <View style={styles.verificationRow}>
        <TextInput
          style={styles.verificationInput}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="이메일 인증 코드"
        />
        <Pressable style={styles.verificationButton} onPress={sendCode}>
          <Text style={styles.verificationButtonText}>{isSendingCode ? "전송 중" : "코드 전송"}</Text>
        </Pressable>
      </View>
      <Pressable style={styles.verificationConfirmButton} onPress={verifyCode}>
        <Text style={styles.verificationConfirmText}>
          {isEmailVerified ? "이메일 인증 완료" : isVerifyingCode ? "확인 중..." : "인증 코드 확인"}
        </Text>
      </Pressable>
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
      {message ? <Text style={styles.accentText}>{message}</Text> : null}
      <PrimaryButton label={isSubmitting ? "처리 중..." : "회원가입"} onPress={submit} />
      <Pressable style={styles.textButton} onPress={onOpenLogin}>
        <Text style={styles.secondaryText}>이미 계정이 있어요 · 로그인</Text>
      </Pressable>
    </ScrollView>
  );
}
