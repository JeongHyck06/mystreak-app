import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Pod } from "../../api";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function JoinPod({
  onBack,
  onPreview,
  onJoin
}: {
  onBack: () => void;
  onPreview: (inviteCode: string) => Promise<Pod>;
  onJoin: (inviteCode: string) => Promise<void>;
}) {
  const [inviteCode, setInviteCode] = useState("");
  const [preview, setPreview] = useState<Pod | null>(null);
  const [error, setError] = useState("");

  const previewPod = async (value: string) => {
    setInviteCode(value);
    setError("");
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    try {
      setPreview(await onPreview(value.trim()));
    } catch {
      setPreview(null);
    }
  };

  const submit = async () => {
    setError("");
    try {
      await onJoin(inviteCode.trim());
    } catch (error) {
      setError(error instanceof Error ? error.message : "팟 가입에 실패했습니다.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="팟 가입" left="‹" onLeft={onBack} />
      <Text style={styles.pageTitle}>초대링크 또는 아이디로{`\n`}참여할 팟을 찾아보세요</Text>
      <View style={styles.joinDivider} />
      <LabeledInput label="초대 코드 입력" value={inviteCode} onChangeText={previewPod} />
      {preview ? <View style={styles.joinCard}>
        <View style={styles.row}>
          <View style={styles.podAvatarLarge} />
          <View style={styles.flex}>
            <Text style={styles.title}>{preview.name}</Text>
            <Text style={styles.caption}>{preview.memberCount}명 참여 중 · {preview.streak}일째</Text>
          </View>
        </View>
        <Text style={styles.secondaryText}>{preview.description}</Text>
        <Text style={styles.tagLine}>{preview.tags.join("  ")}</Text>
      </View> : null}
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <View style={styles.spacer} />
      <PrimaryButton label="이 팟 가입하기" onPress={submit} />
    </ScrollView>
  );
}
