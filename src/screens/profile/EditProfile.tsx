import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Profile } from "../../api";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function EditProfile({
  profile,
  onBack,
  onSave
}: {
  profile: Profile | null;
  onBack: () => void;
  onSave: (profile: Pick<Profile, "name" | "handle" | "bio">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(profile?.name ?? "");
    setHandle(profile?.handle ?? "");
    setBio(profile?.bio ?? "");
  }, [profile]);

  const save = async () => {
    setError("");
    try {
      await onSave({ name, handle, bio });
      onBack();
    } catch (error) {
      setError(error instanceof Error ? error.message : "프로필 저장에 실패했습니다.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.editScreen}>
      <TopBar title="프로필 편집" left="‹" right="저장" onLeft={onBack} onRight={save} />
      <View style={styles.editHero}>
        <View style={styles.profileAvatarLarge}>
          <View style={styles.addBadge}>
            <Text style={styles.socialLight}>+</Text>
          </View>
        </View>
      </View>
      <LabeledInput label="닉네임" value={name} onChangeText={setName} action="편집" />
      <LabeledInput
        label="아이디"
        value={handle}
        onChangeText={setHandle}
        action="편집"
        helper="아이디는 @ 포함 3자 이상이어야 해요"
      />
      <LabeledInput label="한 줄 소개" value={bio} onChangeText={setBio} helper={`${bio.length} / 50`} multiline />
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <Text style={styles.title}>계정 정보</Text>
      <View style={styles.accountCard}>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>이메일</Text>
          <Text style={styles.bodyText}>{profile?.email ?? ""}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>연결된 계정</Text>
          <Text style={styles.cardTitle}>Apple</Text>
        </View>
      </View>
      <PrimaryButton label="프로필 저장하기" onPress={save} />
    </ScrollView>
  );
}
