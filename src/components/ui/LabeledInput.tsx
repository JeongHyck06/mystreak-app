import { Text, TextInput, View } from "react-native";
import { styles } from "../../styles";

export function LabeledInput({
  label,
  value,
  action,
  helper,
  active,
  multiline
}: {
  label: string;
  value: string;
  action?: string;
  helper?: string;
  active?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{label}</Text>
        {action ? <Text style={styles.accentText}>{action}</Text> : null}
      </View>
      <TextInput
        editable={false}
        multiline={multiline}
        value={value}
        style={[styles.input, multiline && styles.textArea, active && styles.inputActive]}
      />
      {helper ? <Text style={[styles.caption, helper.includes("30일") && styles.helperDanger]}>{helper}</Text> : null}
    </View>
  );
}
