import React, { memo, useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View, FlatList, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { theme } from '../core/theme';
import { normalizeNumber } from '../utils';
// const addCommas = new Intl.NumberFormat('en-US');

const LoadingCards = () => {
	return (
		<>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
		</>
	);

	return (
		<View onPress={onPress}>
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
								{total}
							</Text>
							<View style={{ flexDirection: 'row' }}>
								{price !== 0 ? renderPercentChange() : null}
								{amount ? (
									<>
										{price !== 0 ? (
											<View
												style={{
													borderLeftColor:
														theme.colors.black_six,
													borderLeftWidth: 1,
													marginHorizontal: 8,
													marginVertical: 3,
												}}
											/>
										) : null}
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
		</View>
	);
};

export default LoadingCards;
