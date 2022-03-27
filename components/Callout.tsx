import React, { memo } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { theme } from '../core/theme';

type Props = {
	text?: string;
	iconName?: string;
	type?: string;
};

const Callout = ({
	text = 'Test Text',
	iconName = 'info_small.png',
	type = 'default',
}: Props) => {
	return (
		<View
			style={
				type === 'default'
					? {
							backgroundColor: theme.colors.black_eight,
							borderRadius: 18,
							padding: 8,
							flexDirection: 'row',
					  }
					: {
							backgroundColor: theme.colors.error_one,
							borderRadius: 18,
							padding: 8,
							flexDirection: 'row',
					  }
			}
		>
			<Image
				source={require('../assets/icons/shield_small.png')}
				style={{
					width: 24,
					height: 24,
					alignSelf: 'center',
					marginRight: 8,
				}}
			/>

			<Text
				style={
					type === 'default'
						? {
								...theme.fonts.Nunito_Sans.Caption_M_Regular,
								color: theme.colors.black_four,
								flex: 1,
						  }
						: {
								...theme.fonts.Nunito_Sans.Caption_M_Regular,
								color: '#fff',
								flex: 1,
						  }
				}
			>
				{text}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		color: theme.colors.text,
		...theme.fonts.Azeret_Mono.Header_S_SemiBold,
		paddingVertical: 24,
	},
});

export default memo(Callout);
