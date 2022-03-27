import React, { memo } from "react";
import { StyleSheet, Text } from "react-native";
import { theme } from "../core/theme";

type Props = {
  children: React.ReactNode;
  center?: boolean;
  bold?: boolean;
};

const Paragraph = ({ children, center, bold }: Props) => (
  <Text
    style={[
      styles.text,
      center ? styles.center : undefined,
      bold ? styles.bold : undefined,
    ]}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 17,
    lineHeight: 26,
    color: theme.colors.text,
    textAlign: "left",
    marginBottom: 14,
    fontFamily: "Inter_500Medium",
  },
  center: {
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
});

export default memo(Paragraph);
