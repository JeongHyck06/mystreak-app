import { ScrollView, Text, View } from "react-native";
import { LabeledInput, MemberRow, PrimaryButton, TopBar } from "../../components";
import { invitedMembers } from "../../mockData";
import { styles } from "../../styles";

export function InvitePod({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar left="‹" onLeft={onBack} />
      <View style={styles.inviteSummary}>
        <View style={styles.previewDot} />
        <View>
          <Text style={styles.cardTitle}>새벽 5시 러닝 크루</Text>
          <Text style={styles.caption}>8명 중 · 오늘 6명 인증</Text>
        </View>
      </View>
      <LabeledInput label="아이디로 초대하기" value="@친구의 아이디를 입력해주세요" />
      <Text style={styles.cardTitle}>검색 결과</Text>
      <MemberRow name={invitedMembers[0].name} handle={invitedMembers[0].handle} action="초대" />
      <Text style={styles.cardTitle}>초대한 멤버 2명</Text>
      {invitedMembers.slice(1).map((member) => (
        <MemberRow
          key={member.handle}
          name={member.name}
          handle={member.handle}
          action={member.state === "sent" ? "초대 전송됨" : "수락 대기 중"}
          muted={member.state === "sent"}
        />
      ))}
      <LabeledInput label="링크로 초대하기" value="mystreak.app/pod/ABC123" action="복사" />
      <View style={styles.spacer} />
      <PrimaryButton label="초대장 보내기" onPress={onBack} />
    </ScrollView>
  );
}
