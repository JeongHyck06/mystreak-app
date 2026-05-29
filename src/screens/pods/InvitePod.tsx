import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Pod } from "../../api";
import { LabeledInput, MemberRow, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function InvitePod({
  pod,
  onBack,
  onInvite
}: {
  pod: Pod | null;
  onBack: () => void;
  onInvite: (handle: string) => Promise<void>;
}) {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("");

  const submit = async () => {
    setStatus("");
    try {
      await onInvite(handle);
      setStatus("초대장을 보냈습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "초대에 실패했습니다.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="‹" onLeft={onBack} />
      <View style={styles.inviteSummary}>
        <View style={styles.previewDot} />
        <View>
          <Text style={styles.cardTitle}>{pod?.name ?? "팟 선택 필요"}</Text>
          <Text style={styles.caption}>
            {pod ? `${pod.memberCount}명 중 · 오늘 ${pod.certifiedToday}명 인증` : "초대할 팟을 먼저 선택해 주세요"}
          </Text>
        </View>
      </View>
      <LabeledInput label="아이디로 초대하기" value={handle} onChangeText={setHandle} />
      {handle ? <MemberRow name={handle} handle={handle} action="초대" /> : null}
      <LabeledInput label="링크로 초대하기" value={pod?.inviteCode ? `mystreak.app/pod/${pod.inviteCode}` : ""} action="복사" />
      {status ? <Text style={styles.caption}>{status}</Text> : null}
      <View style={styles.spacer} />
      <PrimaryButton label="초대장 보내기" onPress={submit} />
    </ScrollView>
  );
}
