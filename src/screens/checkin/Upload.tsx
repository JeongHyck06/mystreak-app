import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PrimaryButton, TopBar } from "../../components";
import { styles } from "../../styles";

export function Upload({ onClose }: { onClose: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="오늘의 인증" left="×" right="올리기" onLeft={onClose} onRight={onClose} />
      <View style={styles.uploadBox}>
        <View style={styles.uploadChip}>
          <Text style={styles.uploadChipText}>새벽 5시 러닝</Text>
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
        <Text style={styles.caption}>32 / 60</Text>
      </View>
      <TextInput
        multiline
        editable={false}
        value="오늘 날씨가 별로여서 간단하게 했어요"
        style={styles.memoInput}
      />
      <PrimaryButton label="인증 및 스트릭 이어가기" onPress={onClose} />
      <Text style={styles.centerCaption}>업로드 시 팟 멤버가 확인해요!</Text>
    </ScrollView>
  );
}
