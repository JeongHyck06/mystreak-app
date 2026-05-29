import { Text, View } from "react-native";
import { styles } from "../../styles";

export function MemberRow({
  name,
  handle,
  action,
  muted
}: {
  name: string;
  handle: string;
  action: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.smallAvatar} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.caption}>{handle}</Text>
      </View>
      <View style={[styles.memberAction, muted && styles.memberActionMuted]}>
        <Text style={[styles.memberActionText, muted && styles.secondaryText]}>{action}</Text>
      </View>
    </View>
  );
}
