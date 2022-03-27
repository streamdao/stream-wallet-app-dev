import React, { memo, useState, useEffect, useRef } from 'react';
import { Text, ScrollView, PanResponder, Dimensions } from 'react-native';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { AreaChart, Path } from 'react-native-svg-charts';
import {
	Circle,
	Defs,
	G,
	LinearGradient,
	Rect,
	Stop,
	Text as SvgText,
} from 'react-native-svg';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import * as shape from 'd3-shape';
import { theme } from '../core/theme';
import { normalizeNumber } from '../utils';
import * as WebBrowser from 'expo-web-browser';
import * as Serum from '@project-serum/anchor';
import * as SecureStore from 'expo-secure-store';
import { Connection } from '@solana/web3.js';
import { accountFromSeed, mnemonicToSeed } from '../utils/index';

const {
	colors,
	fonts: { Azeret_Mono, Nunito_Sans },
} = theme;
import { SubPageHeader } from '../components';

type Props = {
	navigation: Navigation;
	route: Object;
};

// function apx(size = 0){

// 	let width = Dimensions.get('window').width;
// 	return (width / 750) * size;
// };

const TokenDetailsScreen = ({ navigation, route }: Props) => {
	const token = route.params;
	const [defaultPair, setDefaultPair] = useState();
	const allTokens = useStoreState((state) => state.allTokens);
	const passcode = useStoreState((state) => state.passcode);
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const firstLoadedTokens = useStoreState((state) => state.firstLoadedTokens);

	async function getDefaultPairToken() {
		const hasUSDC = token.pairs.find(
			(pair: object) => pair.symbol === 'USDC',
		);
		if (hasUSDC) {
			const usdcToken = allTokens.find(
				(token: object) => token.symbol === 'USDC',
			);
			setDefaultPair(usdcToken);
		} else {
			const symbol1 = token.pairs[0].symbol;
			const symbol2 = token.pairs[1].symbol;
			const otherToken = allTokens.find(
				(token: object) => token.symbol === symbol1,
			);
			const otherToken2 = allTokens.find(
				(token: object) => token.symbol === symbol2,
			);
			if (otherToken) {
				setDefaultPair(otherToken);
			} else {
				setDefaultPair(otherToken2);
			}
		}
	}

	function getMonthText(number: number) {
		if (number === 1) {
			return 'January';
		}
		if (number === 2) {
			return 'February';
		}
		if (number === 3) {
			return 'March';
		}
		if (number === 4) {
			return 'April';
		}
		if (number === 5) {
			return 'May';
		}
		if (number === 6) {
			return 'June';
		}
		if (number === 7) {
			return 'July';
		}
		if (number === 8) {
			return 'August';
		}
		if (number === 9) {
			return 'September';
		}
		if (number === 10) {
			return 'October';
		}
		if (number === 11) {
			return 'November';
		}
		if (number === 12) {
			return 'December';
		}
	}

	function getYearText(year: number) {
		const string = year.toString();
		const newString = string.slice(2, 4);
		return "'" + newString;
	}

	async function getHistory(options = { limit: 20 }) {
		let mnemonic = await SecureStore.getItemAsync(passcode);
		const seed = await mnemonicToSeed(mnemonic);
		const fromWallet = accountFromSeed(seed, 0, 'bip44', 0);
		const publicKey = fromWallet.publicKey;

		const url =
			'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5';

		const connection = new Connection(url);
		const result = await connection.getConfirmedSignaturesForAddress2(
			publicKey,
			options,
		);

		return result;
	}

	useEffect(() => {
		getHistory();
		if (token.pairs) {
			getDefaultPairToken();
		}
		// main();
	}, [token]);

	//chart stuff
	const Line = ({ line }) => (
		<Path key={'line'} d={line} stroke={'black'} fill={'none'} />
	);

	const apx = (size = 0) => {
		let width = Dimensions.get('window').width;
		return (width / 750) * size;
	};
	const size = useRef(4);

	const [positionX, setPositionX] = useState(-1); // The currently selected X coordinate position

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
			onPanResponderTerminationRequest: (evt, gestureState) => true,

			onPanResponderGrant: (evt, gestureState) => {
				updatePosition(evt.nativeEvent.locationX);
				return true;
			},
			onPanResponderMove: (evt, gestureState) => {
				updatePosition(evt.nativeEvent.locationX);
				return true;
			},
			onPanResponderRelease: () => {
				setPositionX(-1);
			},
		}),
	);

	const updatePosition = (x) => {
		const YAxisWidth = apx(130);
		const x0 = apx(0); // x0 position
		const chartWidth = apx(750) - YAxisWidth - x0;
		const xN = x0 + chartWidth; //xN position
		const xDistance = chartWidth / size.current; // The width of each coordinate point
		if (x <= x0) {
			x = x0;
		}
		if (x >= xN) {
			x = xN;
		}

		// console.log((x - x0) )

		// The selected coordinate x :
		// (x - x0)/ xDistance = value
		let value = ((x - x0) / xDistance).toFixed(0);
		if (value >= size.current - 1) {
			value = size.current - 1; // Out of chart range, automatic correction
		}

		setPositionX(Number(value));
	};

	const Tooltip = ({ x, y, ticks }) => {
		if (positionX < 0) {
			return null;
		}

		// const date = dateList[positionX];
		const date = () => {
			var today = new Date();
			if (positionX === 0) {
				const date = new Date(
					new Date(today).setDate(today.getDate() - 90),
				);
				return (
					date.getDate() +
					' ' +
					getMonthText(date.getMonth()) +
					' ' +
					getYearText(date.getFullYear())
				);
			}
			if (positionX === 1) {
				const date = new Date(
					new Date(today).setDate(today.getDate() - 60),
				);
				return (
					date.getDate() +
					' ' +
					getMonthText(date.getMonth()) +
					' ' +
					getYearText(date.getFullYear())
				);
			}
			if (positionX === 2) {
				const date = new Date(
					new Date(today).setDate(today.getDate() - 30),
				);
				return (
					date.getDate() +
					' ' +
					getMonthText(date.getMonth()) +
					' ' +
					getYearText(date.getFullYear())
				);
			}
			if (positionX === 3) {
				return 'Today';
			}
		};

		return (
			<G x={x(positionX)} key="tooltip">
				<G
					x={positionX > size.current / 2 ? -apx(300 + 10) : apx(10)}
					y={y(priceList[positionX]) - apx(10)}
				>
					<Rect
						y={-apx(24 + 24 + 20) / 2}
						rx={apx(12)} // borderRadius
						ry={apx(12)} // borderRadius
						width={apx(250)}
						height={apx(96)}
						stroke="rgba(254, 190, 24, 0.27)"
						fill={theme.colors.black_one}
					/>
					<SvgText
						x={apx(20)}
						fill="white"
						fontWeight="bold"
						opacity={0.75}
						fontSize={12}
						// fontFamily="Nunito Sans"
					>
						{date()}
					</SvgText>
					<SvgText
						x={apx(20)}
						y={apx(24 + 20)}
						fontSize={17}
						fontWeight="Semibold"
						fill="white"
						// fontFamily="Nunito Sans"
					>
						${priceList[positionX]}
					</SvgText>
				</G>

				<G x={x}>
					<Circle
						cy={y(priceList[positionX])}
						r={apx(70 / 2)}
						stroke="#BABABA"
						strokeWidth={15}
						fill="#0C0C0D"
						opacity={0.5}
					/>
				</G>
			</G>
		);
	};

	const Gradient = () => (
		<Defs key={'defs'}>
			<LinearGradient
				id={'gradient'}
				x1={'0%'}
				y={'0%'}
				x2={'0%'}
				y2={'100%'}
			>
				<Stop
					offset={'0%'}
					stopColor={'rgb(222, 249, 119)'}
					stopOpacity={0.9}
				/>
				<Stop
					offset={'100%'}
					stopColor={'rgb(201, 249, 119)'}
					stopOpacity={0}
				/>
			</LinearGradient>
		</Defs>
	);

	const d90 = parseFloat(normalizeNumber(token.price_90d));
	const d60 = parseFloat(normalizeNumber(token.price_60d));
	const d30 = parseFloat(normalizeNumber(token.price_30d));
	const todayTotal = parseFloat(normalizeNumber(token.price));
	// setChartData([d90, d60, d30, todayTotal]);
	const priceList = [d90, d60, d30, todayTotal];

	return (
		<Background>
			{console.log('hello 23')}
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={token.amount > 0 ? { marginBottom: 80 } : null}
			>
				<SubPageHeader backButton>{token.name} Details</SubPageHeader>

				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						backgroundColor: 'white',
						borderRadius: 18,
						padding: 16,
						marginTop: 8,
						marginBottom: 16,
					}}
				>
					<Text
						style={{
							marginVertical: 8,
							...Azeret_Mono.Body_M_SemiBold,
						}}
					>
						Price History
					</Text>
					<View
						style={{ flexDirection: 'row', alignItems: 'flex-end' }}
					>
						<Text style={{ fontSize: 24, marginRight: 8 }}>
							${normalizeNumber(token.price)}
						</Text>
						{token.change_24h > 0 ? (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									marginBottom: 2,
								}}
							>
								<Image
									source={require('../assets/icons/Upward_Big.jpg')}
									style={{
										width: 24,
										height: 24,
									}}
								/>
								<Text
									style={{
										color: theme.colors.success_one,
										...theme.fonts.Nunito_Sans
											.Caption_M_SemiBold,
									}}
								>
									{normalizeNumber(token.percent_change_24h)}%
									Today
								</Text>
							</View>
						) : (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									marginBottom: 2,
								}}
							>
								<Image
									source={require('../assets/icons/Downward_Big.jpg')}
									style={{
										width: 24,
										height: 24,
									}}
								/>
								<Text
									style={{
										color: theme.colors.error_one,
										...theme.fonts.Nunito_Sans
											.Caption_M_SemiBold,
									}}
								>
									{normalizeNumber(token.percent_change_24h)}%
									Today
								</Text>
							</View>
						)}
					</View>
					<View
						style={{ flex: 1 }}
						{...panResponder.current.panHandlers}
					>
						<AreaChart
							style={{ height: 200 }}
							// data={chartData}
							data={priceList}
							start={0}
							showGrid={false}
							animate={true}
							contentInset={{ top: 30, bottom: 30 }}
							curve={shape.curveNatural}
							svg={{
								fill: 'url(#gradient)',
							}}
						>
							<Gradient />
							<Line />
							<Tooltip />
						</AreaChart>
					</View>
				</View>
				{token.amount ? (
					<View
						style={{
							borderColor: theme.colors.border,
							borderWidth: 1,
							borderRadius: 18,
							padding: 16,
							marginBottom: 16,
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
							}}
						>
							<View style={{ flexDirection: 'row' }}>
								<Image
									source={{ uri: token.logo }}
									style={{
										width: 40,
										height: 40,
										borderRadius: 100,
										marginRight: 16,
									}}
								/>
								<View>
									<Text
										style={{
											...Nunito_Sans.Body_M_Bold,
											color: colors.black_one,
										}}
									>
										{token.symbol}
									</Text>
									<Text
										style={{
											...Nunito_Sans.Caption_M_SemiBold,
											color: colors.black_five,
										}}
									>
										{token.name}
									</Text>
								</View>
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<Text
									style={{
										...Nunito_Sans.Body_M_Bold,
										color: colors.black_one,
									}}
								>
									$
									{normalizeNumber(
										token.amount * token.price,
									)}
								</Text>
								<Text
									style={{
										...Nunito_Sans.Caption_M_SemiBold,
										color: colors.black_five,
									}}
								>
									{normalizeNumber(token.amount)}
								</Text>
							</View>
						</View>
						{/* <View
							style={{
								borderTopColor: colors.border,
								borderTopWidth: 1,
								marginVertical: 16,
							}}
						/>
						<TouchableOpacity style={{ flexDirection: 'row'}}>
							<Text
								style={{
									...Nunito_Sans.Body_M_Bold,
									color: colors.black_four,
									marginRight: 4,
								}}
							>
								See Transaction History
							</Text>
							<Image
								source={require('../assets/icons/Forward_Arrow.png')}
								style={{ width: 24, height: 24 }}
							/>
						</TouchableOpacity> */}
					</View>
				) : null}

				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						borderRadius: 18,
						marginBottom: 16,
					}}
				>
					<View style={{ margin: 16 }}>
						<Text
							style={{
								...Azeret_Mono.Body_M_SemiBold,
								marginBottom: 16,
							}}
						>
							Details
						</Text>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								marginVertical: 16,
							}}
						>
							<Text
								style={{
									...Nunito_Sans.Caption_M_SemiBold,
									color: colors.black_five,
								}}
							>
								Market Cap
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								${normalizeNumber(token.market_cap)}
							</Text>
						</View>
						<View
							style={{
								height: 1,
								backgroundColor: theme.colors.border,
							}}
						/>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								marginVertical: 16,
							}}
						>
							<Text
								style={{
									...Nunito_Sans.Caption_M_SemiBold,
									color: colors.black_five,
								}}
							>
								Share of All Crypto
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								% {normalizeNumber(token.market_cap_dominance)}
							</Text>
						</View>
						<View
							style={{
								height: 1,
								backgroundColor: colors.border,
							}}
						/>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								marginVertical: 16,
							}}
						>
							<Text
								style={{
									...Nunito_Sans.Caption_M_SemiBold,
									color: colors.black_five,
								}}
							>
								24hr Volume
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								${normalizeNumber(token.volume_24h)}
							</Text>
						</View>
					</View>
				</View>

				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						borderRadius: 18,
					}}
				>
					<View style={{ margin: 16 }}>
						<Text
							style={{
								...Azeret_Mono.Body_M_SemiBold,
								marginBottom: 24,
							}}
						>
							Additional Info
						</Text>
						<View
							style={{
								borderWidth: 1,
								borderColor: colors.black_six,
								width: 56,
							}}
						/>
						<View
							style={{ flexDirection: 'row', marginVertical: 24 }}
						>
							{token.extensions.twitter && (
								<TouchableOpacity
									onPress={() =>
										WebBrowser.openBrowserAsync(
											token.extensions.twitter,
										)
									}
									style={{
										borderWidth: 1,
										borderColor: colors.black_six,
										borderRadius: 18,
										width: 56,
										height: 56,
										marginRight: 16,
									}}
								>
									<Image
										source={require('../assets/icons/Twitter_Logo.png')}
										style={{
											width: 24,
											height: 20,
											margin: 16,
										}}
									/>
								</TouchableOpacity>
							)}
							{token.extensions.discord && (
								<TouchableOpacity
									onPress={() =>
										WebBrowser.openBrowserAsync(
											token.extensions.discord,
										)
									}
									style={{
										borderWidth: 1,
										borderColor: colors.black_six,
										borderRadius: 18,
										width: 56,
										height: 56,
										marginRight: 16,
									}}
								>
									<Image
										source={require('../assets/icons/Discord_Logo.png')}
										style={{
											width: 24,
											height: 19,
											margin: 16,
											marginRight: 16,
										}}
									/>
								</TouchableOpacity>
							)}
							{token.extensions.website && (
								<TouchableOpacity
									onPress={() =>
										WebBrowser.openBrowserAsync(
											token.extensions.website,
										)
									}
									style={{
										borderWidth: 1,
										borderColor: colors.black_six,
										borderRadius: 18,
										width: 56,
										height: 56,
									}}
								>
									<Image
										source={require('../assets/icons/globe.png')}
										style={{
											width: 24,
											height: 24,
											margin: 16,
										}}
									/>
								</TouchableOpacity>
							)}
						</View>
						<Text
							style={{
								...Nunito_Sans.Body_M_Regular,
								color: colors.black_four,
							}}
						>
							{token.description}
						</Text>
					</View>
				</View>
			</ScrollView>
			{token.amount > 0 ? (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						position: 'absolute',
						bottom: 0,
						margin: 16,
						width: '100%',
						shadowColor: '#656565',
						shadowOpacity: 0.25,
						shadowOffset: { width: 0, height: 8 },
						shadowRadius: 24,
					}}
				>
					<ThemeButton
						mode="outlined"
						onPress={() => navigation.navigate('Send', token)}
						style={{ width: '50%' }}
						icon={() => (
							<Image
								source={require('../assets/icons/Send.png')}
								style={{
									width: 24,
									height: 24,
									marginRight: -24,
								}}
							/>
						)}
					>
						Send
					</ThemeButton>
					<View style={{ width: 8 }} />
					<ThemeButton
						mode="contained"
						onPress={() => {
							navigation.navigate('Trade', {
								from: token,
								to: defaultPair,
							});
						}}
						style={{
							width: '50%',
						}}
						icon={() => (
							<Image
								source={require('../assets/icons/Trade.png')}
								style={{
									width: 24,
									height: 24,
									marginRight: -20,
								}}
							/>
						)}
					>
						Trade
					</ThemeButton>
				</View>
			) : (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						position: 'absolute',
						bottom: 0,
						margin: 16,
						width: '100%',
						shadowColor: '#656565',
						shadowOpacity: 0.25,
						shadowOffset: { width: 0, height: 8 },
						shadowRadius: 24,
					}}
				>
					<ThemeButton
						mode="contained"
						onPress={() => {
							let fromTokens = ownedTokens;
							if (!ownedTokens) {
								fromTokens = firstLoadedTokens;
							}
							const sortedOwnedTokens = fromTokens.sort(
								(a, b) => {
									return (
										b.price * b.amount - a.price * a.amount
									);
								},
							);
							navigation.navigate('Trade', {
								from: sortedOwnedTokens[0],
								to: token,
							});
						}}
						style={{
							width: '100%',
						}}
						// icon={() => (
						// 	<Image
						// 		source={require('../assets/icons/Trade.png')}
						// 		style={{
						// 			width: 24,
						// 			height: 24,
						// 			// marginRight: -50,
						// 		}}
						// 	/>
						// )}
					>
						Trade
					</ThemeButton>
				</View>
			)}
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
		color: theme.colors.primary,
	},
});

export default memo(TokenDetailsScreen);
