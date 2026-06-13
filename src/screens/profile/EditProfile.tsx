import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { createMediaUpload, uploadMediaToS3, type Profile } from "../../api";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

type SelectedAvatar = {
  uri: string;
  fileName: string;
  contentType: string;
};

export function EditProfile({
  profile,
  onBack,
  onSave
}: {
  profile: Profile | null;
  onBack: () => void;
  onSave: (profile: Pick<Profile, "name" | "handle" | "bio" | "avatarUrl">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
    setHandle(profile?.handle ?? "");
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatarUrl ?? null);
    setSelectedAvatar(null);
  }, [profile]);

  const save = async () => {
    setError("");
    const normalizedHandle = handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;
    setIsSaving(true);
    try {
      let nextAvatarUrl = avatarUrl;
      if (selectedAvatar) {
        const upload = await createMediaUpload({
          fileName: selectedAvatar.fileName,
          contentType: selectedAvatar.contentType,
          mediaType: "IMAGE"
        });
        await uploadMediaToS3(upload.uploadUrl, selectedAvatar.uri, selectedAvatar.contentType);
        nextAvatarUrl = upload.mediaUrl;
      }
      await onSave({ name: name.trim(), handle: normalizedHandle, bio, avatarUrl: nextAvatarUrl });
      onBack();
    } catch (error) {
      setError(error instanceof Error ? error.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("사진 보관함 권한을 허용해 주세요.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setSelectedAvatar({
      uri: asset.uri,
      fileName: asset.fileName ?? "profile-avatar.jpg",
      contentType: asset.mimeType ?? inferImageContentType(asset.uri)
    });
    setError("");
  };

  const avatarPreviewUri = selectedAvatar?.uri ?? avatarUrl ?? undefined;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="프로필 편집" left="‹" right={isSaving ? "저장 중" : "저장"} onLeft={onBack} onRight={save} />
      <Pressable style={styles.editHero} onPress={pickAvatar} accessibilityRole="button">
        <View style={styles.profileAvatarLarge}>
          {avatarPreviewUri ? (
            <Image source={{ uri: avatarPreviewUri }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
          ) : null}
          <View style={styles.addBadge}>
            <Text style={styles.socialLight}>+</Text>
          </View>
        </View>
        <Text style={styles.editHeroHint}>프로필 사진 변경</Text>
      </Pressable>
      <LabeledInput label="닉네임" value={name} onChangeText={setName} helper={`${name.length} / 30`} />
      <LabeledInput
        label="아이디"
        value={handle}
        onChangeText={setHandle}
        helper="아이디는 @ 포함 영문/숫자 3자 이상이어야 해요"
      />
      <LabeledInput
        label="한 줄 소개"
        value={bio}
        onChangeText={setBio}
        helper={`${bio.length} / 50`}
        multiline
      />
      {error ? <Text style={[styles.caption, styles.helperDanger]}>{error}</Text> : null}
      <Text style={styles.title}>계정 정보</Text>
      <View style={styles.accountCard}>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>이메일</Text>
          <Text style={styles.bodyText}>{profile?.email ?? ""}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>연결된 계정</Text>
          <Text style={styles.cardTitle}>{profile?.email ? "이메일" : "확인 중"}</Text>
        </View>
      </View>
      <PrimaryButton label={isSaving ? "저장 중..." : "프로필 저장하기"} onPress={save} />
    </ScrollView>
  );
}

function inferImageContentType(uri: string) {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith(".png")) {
    return "image/png";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/jpeg";
}
