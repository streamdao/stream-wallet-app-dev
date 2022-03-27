import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '../core/theme';

type Props = React.ComponentProps<typeof PaperButton>;

const RedButton = ({ mode, style, children, icon, ...props }: Props) => {
	return (
		<PaperButton
			style={[
				styles.button,
				mode === 'outlined' && {
					backgroundColor: '#FEF2F6',
					borderColor: theme.colors.black_one,
					borderWidth: 1,
				},
				style,
			]}
			labelStyle={[
				styles.text,
				mode === 'outlined' && { color: '#E8083E' },
				style,
			]}
			mode={mode}
			uppercase={false}
			{...props}
			icon={icon}
		>
			{children}
		</PaperButton>
	);
};

const styles = StyleSheet.create({
	button: {
		// width: "auto",
		// flex: 1,
		// marginBottom: 16,
		borderRadius: 20,
		height: 56,
		backgroundColor: '#E8083E',
		justifyContent: 'center',
	},
	text: {
		...theme.fonts.Azeret_Mono.Body_M_Bold,
		lineHeight: 26,
		color: '#FEF2F6',
	},
});

export default memo(RedButton);
