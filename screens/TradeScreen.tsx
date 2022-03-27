import React, { memo, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../core/theme';
const {
	colors,
	fonts: { Azeret_Mono, Nunito_Sans },
} = theme;
import { SubPageHeader } from '../components';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import * as Haptics from 'expo-haptics';

type Props = {
	navigation: Navigation;
	route: Object;
};

const TradeScreen = ({ navigation, route }: Props) => {
	console.log('route . params', route.params);
	const token = route.params;
	const [tradeAmount, setTradeAmount] = useState('0');
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const allTokens = useStoreState((state) => state.allTokens);
	const [filteredTo, setFilteredTo] = useState('');
	const [pair, setPair] = useState({
		from: route.params.from,
		to: route.params.to,
	});
	const firstLoadedTokens = useStoreState((state) => state.firstLoadedTokens);

	let realOwnedTokens = ownedTokens;
	if (!ownedTokens) {
		realOwnedTokens = firstLoadedTokens;
	}

	function addNumber(numberString: string) {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (tradeAmount === '0') {
			const replaceZero = tradeAmount.slice(0, -1);
			const newAmount = replaceZero.concat(numberString);
			setTradeAmount(newAmount);
		} else {
			const newAmount = tradeAmount.concat(numberString);
			setTradeAmount(newAmount);
		}
	}

	function removeNumber() {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (tradeAmount.length === 1) {
			setTradeAmount('0');
		} else {
			const newAmount = tradeAmount.slice(0, -1);
			setTradeAmount(newAmount);
		}
	}

	useEffect(() => {
		if (pair.from.pairs.length > 1) {
			const arrayPairsSimple = [];
			for (let i = 0; i < pair.from.pairs.length; i++) {
				const symbol = pair.from.pairs[i].symbol;
				arrayPairsSimple.push(symbol);
			}

			const filteredList = allTokens.filter((token: object) =>
				arrayPairsSimple.includes(token.symbol),
			);
			setFilteredTo(filteredList);
		}
	}, []);

	useEffect(() => {
		console.log('hit');
		setPair(route.params);
	}, [route.params]);

	useEffect(() => {
		if (pair.from.symbol && pair.from.symbol === 'USDC') {
			setPair({
				...pair,
				to: {
					symbol: 'SOL',
					name: 'Solana',
					logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
					amount: 10,
					price: 150.53,
					mint: 'BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC',
				},
			});
		}
	}, [token]);

	return (
		<Background>
			{console.log('pair from', pair.from.amount, pair.from.price)}
			<SubPageHeader
				subText={`$${(pair.from.amount * pair.from.price).toFixed(
					2,
				)} available`}
				backButton
			>
				Trade {pair.from.name}{' '}
			</SubPageHeader>
			<View>
				<Text style={{ ...styles.bigNumber, alignSelf: 'center' }}>
					${tradeAmount}
				</Text>
			</View>
			{pair.from.amount * pair.from.price < parseFloat(tradeAmount) ? (
				<View>
					<Text
						style={{
							alignSelf: 'center',
							...theme.fonts.Nunito_Sans.Caption_M_Regular,
							color: theme.colors.error_one,
						}}
					>
						You can only trade {pair.from.symbol} that you have
						available
					</Text>
				</View>
			) : null}
			<View
				style={{
					borderColor: colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate('From Token', {
							pair,
							setPair,
						})
					}
					style={{ flexDirection: 'row', alignItems: 'center' }}
				>
					<Image
						source={{ uri: pair.from.logo }}
						style={{
							width: 40,
							height: 40,
							borderRadius: 100,
							marginRight: 16,
						}}
					/>
					<View>
						<Text style={styles.toFrom}>From</Text>
						<Text style={styles.swapTokens}>
							{pair.from.symbol}
						</Text>
					</View>
				</TouchableOpacity>
				{realOwnedTokens.find(
					(token) => token.symbol === pair.to.symbol,
				) ? (
					<>
						{console.log('hello')}
						<TouchableOpacity
							style={styles.swapContainer}
							onPress={() => {
								Haptics.impactAsync(
									Haptics.ImpactFeedbackStyle.Medium,
								);
								const fromToken2 = pair.from;
								let toToken2 = realOwnedTokens.find(
									(token) => token.symbol === pair.to.symbol,
								);
								setPair({
									...pair,
									from: toToken2,
									to: fromToken2,
								});
							}}
						>
							<Image
								source={require('../assets/icons/Swap.png')}
								style={{ width: 24, height: 24 }}
							/>
						</TouchableOpacity>
					</>
				) : (
					<View style={styles.swapContainer} opacity={0.5}>
						<Image
							source={require('../assets/icons/Swap.png')}
							style={{ width: 24, height: 24 }}
						/>
					</View>
				)}
				<TouchableOpacity
					onPress={() =>
						navigation.navigate('To Token', {
							pair,
							setPair,
						})
					}
					style={{ flexDirection: 'row', alignItems: 'center' }}
				>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={styles.toFrom}>To</Text>
						<Text style={styles.swapTokens}>{pair.to.symbol}</Text>
					</View>
					<Image
						source={{ uri: pair.to.logo }}
						style={{
							width: 40,
							height: 40,
							borderRadius: 100,
							marginLeft: 16,
						}}
					/>
				</TouchableOpacity>
			</View>
			<View>
				<View style={styles.numRow}>
					<TouchableOpacity
						onPress={() => addNumber('1')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>1</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('2')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>2</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('3')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>3</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.numRow}>
					<TouchableOpacity
						onPress={() => addNumber('4')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>4</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('5')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>5</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('6')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>6</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.numRow}>
					<TouchableOpacity
						onPress={() => addNumber('7')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>7</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('8')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>8</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('9')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>9</Text>
					</TouchableOpacity>
				</View>
				<View style={{ ...styles.numRow, marginBottom: 0 }}>
					<TouchableOpacity
						onPress={() => addNumber('.')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>.</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => addNumber('0')}
						style={styles.numberContainer}
					>
						<Text style={styles.mediumNumber}>0</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => removeNumber()}
						style={styles.numberContainer}
					>
						{/* <Text style={styles.mediumNumber}>3</Text> */}
						<Image
							source={require('../assets/icons/arrow-left-big.png')}
							style={{ width: 40, height: 40 }}
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View
				style={{ marginBottom: 40 }}
				opacity={
					parseFloat(tradeAmount) > 0 &&
					pair.from.amount * pair.from.price > parseFloat(tradeAmount)
						? 1
						: 0.65
				}
			>
				<ThemeButton
					onPress={() => {
						if (
							parseFloat(tradeAmount) > 0 &&
							pair.from.amount * pair.from.price >
								parseFloat(tradeAmount)
						) {
							Haptics.impactAsync(
								Haptics.ImpactFeedbackStyle.Medium,
							);
							navigation.navigate('Trade Preview', {
								tradeAmount,
								pair,
							});
						}
					}}
				>
					Review Trade
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

export default memo(TradeScreen);
