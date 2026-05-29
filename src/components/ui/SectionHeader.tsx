import { Pressable, Text, View } from "react-native";
import { styles } from "../../styles";

export function SectionHeader({
  title,
  action,
  onAction
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.accentText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
