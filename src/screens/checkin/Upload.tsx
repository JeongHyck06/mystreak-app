import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Pod } from "../../api";
import { PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function Upload({
  pod,
  onClose,
  onSubmit
}: {
  pod: Pod | null;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!pod) {
      setError("인증할 팟을 먼저 선택해 주세요.");
      return;
    }
    setError("");
    try {
      await onSubmit(text);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "인증 등록에 실패했습니다.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="오늘의 인증" left="×" right="올리기" onLeft={onClose} onRight={submit} />
      <View style={styles.uploadBox}>
        <View style={styles.uploadChip}>
          <Text style={styles.uploadChipText}>{pod?.name ?? "팟 선택 필요"}</Text>
        </View>
        <Pressable style={styles.cropButton}>
          <Text style={styles.cropButtonText}>사진 자르기</Text>
        </Pressable>
      </View>
      <View style={styles.uploadTabs}>
        <Text style={styles.uploadTabActive}>사진</Text>
        <Text style={styles.uploadTab}>카메라</Text>
        <Text style={styles.uploadTab}>동영상</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>한 줄 메모</Text>
        <Text style={styles.caption}>{text.length} / 60</Text>
      </View>
      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        placeholder="오늘의 인증 메모를 입력하세요"
        style={styles.memoInput}
      />
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <PrimaryButton label="인증 및 스트릭 이어가기" onPress={submit} />
      <Text style={styles.centerCaption}>업로드 시 팟 멤버가 확인해요!</Text>
    </ScrollView>
  );
}
