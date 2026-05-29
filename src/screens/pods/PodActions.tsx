import { ScrollView, Text, View } from "react-native";
import { PressScale, TopBar } from "../../components";
import { styles } from "../../styles";

export function PodActions({
  onBack,
  onCreate,
  onJoin
}: {
  onBack: () => void;
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <TopBar title="팟 시작하기" left="‹" onLeft={onBack} />
      <Text style={styles.pageTitle}>새 팟을 만들거나{`\n`}초대받은 팟에 참가해요</Text>
      <Text style={styles.bodyCopy}>
        함께할 멤버를 모으거나 초대링크로 바로 참여할 수 있어요.
      </Text>
      <PressScale style={styles.actionCard} onPress={onCreate}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionIconText}>+</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.actionTitle}>팟 만들기</Text>
          <Text style={styles.actionDescription}>목표, 인증 방식, 최대 인원을 정하고 새 팟을 열어요.</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </PressScale>
      <PressScale style={styles.actionCard} onPress={onJoin}>
        <View style={[styles.actionIcon, styles.actionIconLight]}>
          <Text style={styles.actionIconAccent}>↗</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.actionTitle}>팟 참가하기</Text>
          <Text style={styles.actionDescription}>초대링크나 아이디로 참여할 팟을 찾아요.</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </PressScale>
    </ScrollView>
  );
}
