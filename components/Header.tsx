import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../core/theme';

type Props = {
	children: React.ReactNode;
};

const Header = ({ children }: Props) => (
	<Text style={styles.header}>{children}</Text>
);

const styles = StyleSheet.create({
	header: {
		color: theme.colors.text,
		...theme.fonts.Azeret_Mono.Header_S_SemiBold,
		paddingVertical: 24,
	},
});

export default memo(Header);
