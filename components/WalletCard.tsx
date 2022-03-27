import React, { memo, useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View, FlatList, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { theme } from '../core/theme';
import { normalizeNumber } from '../utils';

const WalletCard = (info: object) => {
	let walletName, walletAddress, walletBalance;
	if (info.token) {
		mint = info.token.item.mint;
		price = info.token.item.price;
		amount = info.token.item.amount;
		name = info.token.item.name;
		symbol = info.token.item.symbol;
		logo = info.token.item.logo;
		percent_change_24h = info.token.item.percent_change_24h;
	} else {
		console.log('route hitttt');
		mint = info.mint;
		price = info.price;
		amount = info.amount;
		name = info.name;
		symbol = info.symbol;
		logo = info.logo;
		percent_change_24h = info.percent_change_24h;
	}
	const { onPress } = info;


	return (
		<TouchableOpacity onPress={onPress}>
			<Card.Title
				title={symbol}
				titleStyle={{
					color: '#1F1F1F',
					...theme.fonts.Nunito_Sans.Body_M_Bold,
					marginBottom: 0,
				}}
				subtitle={name}
				subtitleStyle={{
					...theme.fonts.Nunito_Sans.Caption_M_SemiBold,
					color: '#727D8D',
				}}
				style={{
					backgroundColor: 'white',
					borderRadius: 18,
					marginBottom: 8,
					borderWidth: 1,
					borderColor: theme.colors.border,
				}}
				left={(props) => {
					return (
						<Image
							style={{ height: 32, width: 32, borderRadius: 100 }}
							source={{ uri: logo }}
						/>
					);
				}}
				right={(props) => {
					return (
						<View
							style={{
								alignItems: 'flex-end',
								marginRight: 16,
							}}
						>
							<Text
								style={{
									...theme.fonts.Nunito_Sans.Body_M_Bold,
									color: '#1F1F1F',
									marginBottom: 4,
								}}
							>
								{amount
									? `$${normalizeNumber(amount * price)}`
									: `$${normalizeNumber(price)}`}
							</Text>
							<View style={{ flexDirection: 'row' }}>
								{percent_change_24h > 0 ? (
									<Image
										source={require('../assets/icons/Upward.jpg')}
										style={{
											width: 16,
											height: 16,
											marginVertical: 2,
										}}
									/>
								) : (
									<Image
										source={require('../assets/icons/Downward.jpg')}
										style={{
											width: 16,
											height: 16,
											marginVertical: 2,
										}}
									/>
								)}
								<Text
									style={[
										theme.fonts.Nunito_Sans
											.Caption_M_SemiBold,
										percent_change_24h > 0
											? {
													color: theme.colors
														.success_one,
											  }
											: {
													color: theme.colors
														.error_one,
											  },
									]}
								>{`${normalizeNumber(
									percent_change_24h,
								)}%`}</Text>
								{amount ? (
									<>
										<View
											style={{
												borderLeftColor:
													theme.colors.black_six,
												borderLeftWidth: 1,
												marginHorizontal: 8,
												marginVertical: 3,
											}}
										/>
										<Text
											style={{
												...theme.fonts.Nunito_Sans
													.Caption_M_SemiBold,
												color: '#727D8D',
											}}
										>
											{normalizeNumber(amount)}
										</Text>
									</>
								) : null}
							</View>
						</View>
					);
				}}
			/>
		</TouchableOpacity>
	);
};

export default WalletCard;
