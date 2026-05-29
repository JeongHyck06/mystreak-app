import { ScrollView, Text, View } from "react-native";
import { LabeledInput, PrimaryButton, TopBar } from "../../components";
import { user } from "../../mockData";
import { styles } from "../../styles";

export function EditProfile({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.editScreen}>
      <TopBar title="프로필 편집" left="‹" right="저장" onLeft={onBack} onRight={onBack} />
      <View style={styles.editHero}>
        <View style={styles.profileAvatarLarge}>
          <View style={styles.addBadge}>
            <Text style={styles.socialLight}>+</Text>
          </View>
        </View>
      </View>
      <LabeledInput label="닉네임" value={user.name} action="편집" />
      <LabeledInput label="아이디" value={user.handle} action="편집" helper="아이디는 30일에 한 번만 변경 가능해요" />
      <LabeledInput label="한 줄 소개" value={user.editBio} helper="19 / 50" multiline />
      <Text style={styles.title}>계정 정보</Text>
      <View style={styles.accountCard}>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>이메일</Text>
          <Text style={styles.bodyText}>{user.email}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.cardTitle}>연결된 계정</Text>
          <Text style={styles.cardTitle}>Apple</Text>
        </View>
      </View>
      <PrimaryButton label="프로필 저장하기" onPress={onBack} />
    </ScrollView>
  );
}
