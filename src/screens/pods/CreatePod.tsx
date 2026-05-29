import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Pod } from "../../api";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function CreatePod({
  onClose,
  onCreate
}: {
  onClose: (pod?: Pod) => void;
  onCreate: (pod: {
    name: string;
    description: string;
    maxMembers: number;
    tagLine: string;
    tags: string[];
  }) => Promise<Pod>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("8");
  const [tagLine, setTagLine] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const pod = await onCreate({
        name,
        description,
        maxMembers: Number(maxMembers),
        tagLine,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      });
      onClose(pod);
    } catch (error) {
      setError(error instanceof Error ? error.message : "팟 생성에 실패했습니다.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="×" right="다음" onLeft={() => onClose()} onRight={submit} />
      <Text style={styles.sectionCaption}>팟 기본 정보</Text>
      <LabeledInput label="팟 이름" value={name} onChangeText={setName} active />
      <LabeledInput label="소개" value={description} onChangeText={setDescription} multiline />
      <LabeledInput label="최대 인원" value={maxMembers} onChangeText={setMaxMembers} />
      <LabeledInput label="인증 방식" value={tagLine} onChangeText={setTagLine} />
      <LabeledInput label="태그" value={tags} onChangeText={setTags} helper="쉼표로 구분해 주세요" />
      <View style={styles.previewCard}>
        <Text style={styles.accentText}>미리보기</Text>
        <View style={styles.row}>
          <View style={styles.previewDot} />
          <View>
            <Text style={styles.cardTitle}>{name || "팟 이름"}</Text>
            <Text style={styles.caption}>{tagLine || "인증 방식"} · 최대 {maxMembers || 0}명</Text>
          </View>
        </View>
      </View>
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <View style={styles.spacer} />
      <PrimaryButton label="팟 만들기" onPress={submit} />
    </ScrollView>
  );
}
