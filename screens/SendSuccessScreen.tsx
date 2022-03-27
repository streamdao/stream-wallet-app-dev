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
import { TouchableOpacity } from 'react-native-gesture-handler';
import { copyToClipboard } from '../utils/index';

type Props = {
	navigation: Navigation;
	route: Object;
};

const SendSuccessScreen = ({ navigation, route }: Props) => {
	const token = route.params.token;
	const tradeAmount = route.params.tradeAmount;
	const transferAmount = route.params.transferAmount;
	const toWallet = route.params.toWallet;

	return (
		<Background>
			<View>
				<SubPageHeader backButton>Send Successful</SubPageHeader>
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
						You successfully sent {token.symbol}!
					</Text>
					<Text
						style={{
							...Nunito_Sans.Body_M_SemiBold,
							color: colors.black_one,
							marginBottom: 16,
							alignSelf: 'center',
							textAlign: 'center',
						}}
					>
						{token.price < 0
							? `$${tradeAmount} of ${token.symbol} was sent to the following address:`
							: `${tradeAmount} of ${token.symbol} was sent to the following address:`}
					</Text>
					<TouchableOpacity onPress={() => copyToClipboard(toWallet)}>
						<Text
							style={{
								...Nunito_Sans.Body_M_Regular,
								color: colors.black_five,
								textAlign: 'center',
								paddingHorizontal: 16,
							}}
						>
							{toWallet}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={{ marginBottom: 40 }}>
				<ThemeButton
					onPress={() => navigation.navigate('Token Details', token)}
				>
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

export default memo(SendSuccessScreen);
