import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
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
  const inviteCode = pod?.inviteCode ?? "";
  const inviteLink = inviteCode ? `mystreak.app/pod/${inviteCode}` : "";

  const submit = async () => {
    setStatus("");
    try {
      await onInvite(handle);
      setStatus("초대장을 보냈습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "초대에 실패했습니다.");
    }
  };

  const copy = async (value: string, label: string) => {
    if (!value) {
      setStatus("복사할 내용이 없습니다.");
      return;
    }
    await Clipboard.setStringAsync(value);
    setStatus(`${label}를 복사했습니다.`);
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
      <View style={styles.fieldGroup}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>초대 코드</Text>
          <Pressable onPress={() => copy(inviteCode, "초대 코드")} hitSlop={8}>
            <Text style={styles.accentText}>복사</Text>
          </Pressable>
        </View>
        <View style={styles.copyField}>
          <Text style={styles.copyFieldText}>{inviteCode || "팟을 먼저 선택해 주세요"}</Text>
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>링크로 초대하기</Text>
          <Pressable onPress={() => copy(inviteLink, "초대 링크")} hitSlop={8}>
            <Text style={styles.accentText}>복사</Text>
          </Pressable>
        </View>
        <View style={styles.copyField}>
          <Text style={styles.copyFieldText}>{inviteLink || "팟을 먼저 선택해 주세요"}</Text>
        </View>
      </View>
      {status ? <Text style={styles.caption}>{status}</Text> : null}
      <View style={styles.spacer} />
      <PrimaryButton label="초대장 보내기" onPress={submit} />
    </ScrollView>
  );
}
