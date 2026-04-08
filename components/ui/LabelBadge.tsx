import { Label } from "@/models/Label";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  label: Label;
  size?: "sm" | "md";
}

export default function LabelBadge({ label, size = "sm" }: Props) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: label.color + "22" },
        size === "md" && styles.pillMd,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: label.color },
          size === "md" && styles.dotMd,
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: label.color },
          size === "md" && styles.textMd,
        ]}
      >
        {label.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotMd: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
  },
  textMd: {
    fontSize: 12,
    fontWeight: "600",
  },
});
