import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { createMediaUpload, uploadMediaToS3, type Pod } from "../../api";
import { PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

type SelectedMedia = {
  uri: string;
  fileName: string;
  contentType: string;
  mediaType: "IMAGE" | "VIDEO";
  durationSeconds?: number;
};

const MAX_VIDEO_SECONDS = 15;

export function Upload({
  pod,
  onClose,
  onSubmit
}: {
  pod: Pod | null;
  onClose: () => void;
  onSubmit: (text: string, mediaUrl?: string | null) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (isSubmitting) {
      return;
    }
    if (!pod) {
      setError("인증할 팟을 먼저 선택해 주세요.");
      return;
    }
    if (!selectedMedia) {
      setError("사진, 카메라 촬영, 동영상 촬영/선택 중 하나를 추가해 주세요.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const upload = await createMediaUpload({
        fileName: selectedMedia.fileName,
        contentType: selectedMedia.contentType,
        mediaType: selectedMedia.mediaType,
        durationSeconds: selectedMedia.durationSeconds
      });
      await uploadMediaToS3(upload.uploadUrl, selectedMedia.uri, selectedMedia.contentType);
      await onSubmit(text, upload.mediaUrl);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "인증 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85
    });
    setImageFromResult(result, "proof.jpg");
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("카메라 권한을 허용해 주세요.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85
    });
    setImageFromResult(result, "camera-proof.jpg");
  };

  const pickVideo = async () => {
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: MAX_VIDEO_SECONDS
    });
    setVideoFromResult(result, "proof-video.mp4");
  };

  const takeVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("카메라 권한을 허용해 주세요.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: MAX_VIDEO_SECONDS,
      quality: 0.85
    });
    setVideoFromResult(result, "camera-proof-video.mp4");
  };

  const ensureLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("사진 보관함 권한을 허용해 주세요.");
      return false;
    }
    return true;
  };

  const setImageFromResult = (result: ImagePicker.ImagePickerResult, fallbackFileName: string) => {
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];
    setSelectedMedia({
      uri: asset.uri,
      fileName: asset.fileName ?? fallbackFileName,
      contentType: asset.mimeType ?? inferContentType(asset.uri, "IMAGE"),
      mediaType: "IMAGE"
    });
    setError("");
  };

  const setVideoFromResult = (result: ImagePicker.ImagePickerResult, fallbackFileName: string) => {
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const durationSeconds = asset.duration == null ? null : Math.ceil(asset.duration / 1000);
    if (durationSeconds == null) {
      setError("동영상 길이를 확인할 수 없어 업로드할 수 없습니다.");
      return;
    }
    if (durationSeconds > MAX_VIDEO_SECONDS) {
      setError("동영상은 15초 이내만 업로드할 수 있습니다.");
      return;
    }

    setSelectedMedia({
      uri: asset.uri,
      fileName: asset.fileName ?? fallbackFileName,
      contentType: asset.mimeType ?? inferContentType(asset.uri, "VIDEO"),
      mediaType: "VIDEO",
      durationSeconds
    });
    setError("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={12}
    >
      <ScrollView
        contentContainerStyle={styles.uploadScreen}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <TopBar title="오늘의 인증" left="×" right="올리기" onLeft={onClose} onRight={submit} />
        <View style={styles.uploadBox}>
          <View style={styles.uploadChip}>
            <Text style={styles.uploadChipText}>{pod?.name ?? "팟 선택 필요"}</Text>
          </View>
          {selectedMedia ? (
            selectedMedia.mediaType === "IMAGE" ? (
              <View style={styles.uploadPreviewFrame}>
                <Image source={{ uri: selectedMedia.uri }} style={styles.uploadPreviewImage} />
              </View>
            ) : (
              <View style={styles.uploadVideoPreview}>
                <Text style={styles.uploadVideoIcon}>▶</Text>
                <Text style={styles.uploadVideoTitle}>동영상 선택 완료</Text>
                <Text style={styles.uploadVideoCaption}>{selectedMedia.durationSeconds}초 / 최대 15초</Text>
              </View>
            )
          ) : (
            <View style={styles.uploadEmpty}>
              <Text style={styles.uploadEmptyTitle}>오늘의 인증 미디어를 추가해 주세요</Text>
              <Text style={styles.uploadEmptyCaption}>사진 업로드, 카메라 촬영, 15초 이내 동영상을 지원해요.</Text>
            </View>
          )}
          <Pressable style={styles.cropButton} onPress={selectedMedia?.mediaType === "VIDEO" ? pickVideo : pickImage}>
            <Text style={styles.cropButtonText}>{selectedMedia ? "다시 선택하기" : "사진 선택하기"}</Text>
          </Pressable>
        </View>
        <View style={styles.uploadTabs}>
          <Pressable style={styles.uploadTabButton} onPress={pickImage}>
            <Text style={selectedMedia?.mediaType === "IMAGE" ? styles.uploadTabActive : styles.uploadTab}>사진</Text>
          </Pressable>
          <Pressable style={styles.uploadTabButton} onPress={takePhoto}>
            <Text style={styles.uploadTab}>카메라</Text>
          </Pressable>
          <Pressable style={styles.uploadTabButton} onPress={takeVideo}>
            <Text style={styles.uploadTab}>동영상 촬영</Text>
          </Pressable>
          <Pressable style={styles.uploadTabButton} onPress={pickVideo}>
            <Text style={selectedMedia?.mediaType === "VIDEO" ? styles.uploadTabActive : styles.uploadTab}>동영상</Text>
          </Pressable>
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
        <PrimaryButton label={isSubmitting ? "업로드 중..." : "인증 및 스트릭 이어가기"} onPress={submit} />
        <Text style={styles.centerCaption}>업로드 시 팟 멤버가 확인해요!</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function inferContentType(uri: string, mediaType: "IMAGE" | "VIDEO") {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith(".png")) {
    return "image/png";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  if (normalized.endsWith(".mov") || normalized.endsWith(".qt")) {
    return "video/quicktime";
  }
  if (mediaType === "VIDEO") {
    return "video/mp4";
  }
  return "image/jpeg";
}
