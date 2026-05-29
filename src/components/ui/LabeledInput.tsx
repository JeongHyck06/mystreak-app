import { Text, TextInput, View } from "react-native";
import { styles } from "../../styles";

export function LabeledInput({
  label,
  value,
  onChangeText,
  action,
  helper,
  active,
  multiline,
  editable = true
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  action?: string;
  helper?: string;
  active?: boolean;
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{label}</Text>
        {action ? <Text style={styles.accentText}>{action}</Text> : null}
      </View>
      <TextInput
        editable={editable}
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.textArea, active && styles.inputActive]}
      />
      {helper ? <Text style={[styles.caption, helper.includes("30일") && styles.helperDanger]}>{helper}</Text> : null}
    </View>
  );
}
