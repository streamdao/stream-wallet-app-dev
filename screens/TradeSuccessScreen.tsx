import React, { memo } from 'react';
import { Text } from 'react-native';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
const {
	colors,
	fonts: { Azeret_Mono, Nunito_Sans },
} = theme;
import { SubPageHeader } from '../components';

type Props = {
	navigation: Navigation;
	route: Object;
};

const TradeSuccessScreen = ({ navigation, route }: Props) => {
	const details = route.params;
	console.log('details: ', details);

	return (
		<Background>
			<View>
				<SubPageHeader backButton>Trade Successful</SubPageHeader>
				<View style={{ alignItems: 'center' }}>
					<Image
						source={require('../assets/images/Success_Image.png')}
						style={{ width: 266, height: 234, marginVertical: 24 }}
					/>

					<Text
						style={{
							...Nunito_Sans.Body_L_Bold,
							color: colors.black_one,
							marginVertical: 16,
						}}
					>
						Your trade was successful!
					</Text>
					<Text
						style={{
							...Nunito_Sans.Body_M_SemiBold,
							color: colors.black_one,
							marginBottom: 16,
						}}
					>
						${details.tradeAmount} of {details.fromTo.from.name} was
						converted to {details.fromTo.to.name}
					</Text>
				</View>
			</View>
			<View style={{ marginBottom: 40 }}>
				<ThemeButton onPress={() => navigation.navigate('Dashboard')}>
					Done
				</ThemeButton>
			</View>
		</Background>
	);
};

const styles = StyleSheet.create({
	tableLabel: {
		fontSize: 14,
		color: '#727D8D',
	},
	tableData: {
		fontSize: 17,
		color: colors.primary,
	},
	bigNumber: {
		fontSize: 84,
		fontFamily: 'Nunito Sans',
		fontWeight: '400',
		color: colors.black_two,
	},
	mediumNumber: {
		fontSize: 48,
		fontFamily: 'Nunito Sans',
		fontWeight: '400',
		color: colors.black_one,
	},
	numberContainer: {
		width: 56,
		height: 66,
		justifyContent: 'center',
		alignItems: 'center',
	},
	toFrom: {
		...Nunito_Sans.Caption_M_Regular,
		color: colors.black_five,
		marginBottom: 4,
	},
	swapTokens: {
		...Nunito_Sans.Body_M_Regular,
		color: colors.black_two,
	},
	swapContainer: {
		borderColor: colors.border,
		borderWidth: 1,
		borderRadius: 18,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	numRow: {
		flexDirection: 'row',
		alignSelf: 'stretch',
		justifyContent: 'space-between',
		marginHorizontal: 16,
		marginBottom: 16,
	},
});

export default memo(TradeSuccessScreen);
