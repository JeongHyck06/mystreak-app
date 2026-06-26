import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { createMediaUpload, uploadMediaToS3, type Pod } from "../../api";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

type SelectedPodAvatar = {
  uri: string;
  fileName: string;
  contentType: string;
};

const DEFAULT_MAX_MEMBERS = 30;

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
    avatarUrl?: string | null;
  }) => Promise<Pod>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [tags, setTags] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedPodAvatar | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      let avatarUrl: string | null = null;
      if (selectedAvatar) {
        const upload = await createMediaUpload({
          fileName: selectedAvatar.fileName,
          contentType: selectedAvatar.contentType,
          mediaType: "IMAGE"
        });
        await uploadMediaToS3(upload.uploadUrl, selectedAvatar.uri, selectedAvatar.contentType);
        avatarUrl = upload.mediaUrl;
      }
      const pod = await onCreate({
        name: name.trim(),
        description: description.trim(),
        maxMembers: DEFAULT_MAX_MEMBERS,
        tagLine: tagLine.trim(),
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        avatarUrl
      });
      onClose(pod);
    } catch (error) {
      setError(error instanceof Error ? error.message : "팟 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
      fileName: asset.fileName ?? "pod-avatar.jpg",
      contentType: asset.mimeType ?? inferImageContentType(asset.uri)
    });
    setError("");
  };

  const avatarPreviewUri = selectedAvatar?.uri;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="×" right={isSubmitting ? "생성 중" : "다음"} onLeft={() => onClose()} onRight={submit} />
      <Text style={styles.sectionCaption}>팟 기본 정보</Text>
      <Pressable style={styles.editHero} onPress={pickAvatar} accessibilityRole="button">
        <View style={styles.profileAvatarLarge}>
          {avatarPreviewUri ? (
            <Image source={{ uri: avatarPreviewUri }} style={styles.avatarFill} />
          ) : null}
          <View style={styles.addBadge}>
            <Text style={styles.socialLight}>+</Text>
          </View>
        </View>
        <Text style={styles.editHeroHint}>팟 프로필 이미지 추가</Text>
      </Pressable>
      <LabeledInput label="팟 이름" value={name} onChangeText={setName} active />
      <LabeledInput label="소개" value={description} onChangeText={setDescription} multiline />
      <LabeledInput label="인증 방식" value={tagLine} onChangeText={setTagLine} />
      <LabeledInput label="태그" value={tags} onChangeText={setTags} helper="쉼표로 구분해 주세요" />
      <View style={styles.previewCard}>
        <Text style={styles.accentText}>미리보기</Text>
        <View style={styles.row}>
          <View style={styles.previewDot}>
            {avatarPreviewUri ? <Image source={{ uri: avatarPreviewUri }} style={styles.avatarFill} /> : null}
          </View>
          <View>
            <Text style={styles.cardTitle}>{name || "팟 이름"}</Text>
            <Text style={styles.caption}>{tagLine || "인증 방식"}</Text>
          </View>
        </View>
      </View>
      {error ? <Text style={styles.caption}>{error}</Text> : null}
      <View style={styles.spacer} />
      <PrimaryButton label={isSubmitting ? "팟 만드는 중..." : "팟 만들기"} onPress={submit} />
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
