import React, { memo, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../core/theme';
import Modal from 'react-native-modal';
const {
	colors,
	fonts: { Azeret_Mono, Nunito_Sans },
} = theme;
import { SubPageHeader } from '../components';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import * as SecureStore from 'expo-secure-store';
import {
	findAssociatedTokenAddress,
	getAccountFromSeed,
	DERIVATION_PATH,
} from '../utils';
import { Account, Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Market } from '@project-serum/serum';
import { normalizeNumber, mnemonicToSeed, accountFromSeed } from '../utils';
import * as Haptics from 'expo-haptics';
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/core';

type Props = {
	navigation: Navigation;
	route: Object;
};

interface Token {
	chainId: number; // 101,
	address: string; // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	symbol: string; // 'USDC',
	name: string; // 'Wrapped USDC',
	decimals: number; // 6,
	logoURI: string; // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
	tags: string[]; // [ 'stablecoin' ]
}

const TradePreviewScreen = ({ navigation, route }: Props) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [price, setPrice] = useState('');
	const [outputDollarPrice, setOutputDollarPrice] = useState(0);
	const [displayPrice, setDisplayPrice] = useState('');
	const [size, setSize] = useState('');
	const [side, setSide] = useState('sell');
	const [marketAddress, setMarketAddress] = useState('');
	const [fees, setFees] = useState({});
	const [outAmount, setOutAmount] = useState('');
	const tradeAmount = route.params.tradeAmount;
	const fromTo = route.params.pair;
	const passcode = useStoreState((state) => state.passcode);
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const [bestRoute2, setBestRoute2] = useState(null);
	const [jupiterObject, setJupiterObject] = useState(null);

	const getPossiblePairsTokenInfo = ({
		tokens,
		routeMap,
		inputToken,
	}: {
		tokens: Token[];
		routeMap: Map<string, string[]>;
		inputToken?: Token;
	}) => {
		try {
			if (!inputToken) {
				return {};
			}

			const possiblePairs = inputToken
				? routeMap.get(inputToken.address) || []
				: []; // return an array of token mints that can be swapped with SOL
			const possiblePairsTokenInfo: { [key: string]: Token | undefined } =
				{};
			possiblePairs.forEach((address) => {
				possiblePairsTokenInfo[address] = tokens.find((t) => {
					return t.address == address;
				});
			});
			// Perform your conditionals here to use other outputToken
			// const alternativeOutputToken = possiblePairsTokenInfo[USDT_MINT_ADDRESS]
			return possiblePairsTokenInfo;
		} catch (error) {
			throw error;
		}
	};

	const getRoutes = async ({
		jupiter,
		inputToken,
		outputToken,
		inputAmount,
		slippage,
	}: {
		jupiter: Jupiter;
		inputToken?: Token;
		outputToken?: Token;
		inputAmount: number;
		slippage: number;
	}) => {
		try {
			if (!inputToken || !outputToken) {
				return null;
			}

			console.log('Getting routes');
			const inputAmountLamports = inputToken
				? Math.round(inputAmount * 10 ** inputToken.decimals)
				: 0; // Lamports based on token decimals
			const routes =
				inputToken && outputToken
					? await jupiter.computeRoutes(
							new PublicKey(inputToken.address),
							new PublicKey(outputToken.address),
							inputAmountLamports,
							slippage,
							true,
					  )
					: null;

			if (routes && routes.routesInfos) {
				console.log(
					'Possible number of routes:',
					routes.routesInfos.length,
				);
				console.log('Best quote: ', routes.routesInfos[0].outAmount);
				return routes;
			} else {
				return null;
			}
		} catch (error) {
			throw error;
		}
	};

	const executeSwap = async ({
		jupiter,
		route,
	}: {
		jupiter: Jupiter;
		route: RouteInfo;
	}) => {
		try {
			// Prepare execute exchange
			const { execute } = await jupiter.exchange({
				route,
			});
			console.log('execute: ', execute);
			// Execute swap
			const swapResult: any = await execute().catch((err) =>
				console.log('error with trade', err),
			); // Force any to ignore TS misidentifying SwapResult type
			console.log('swapResult: ', swapResult);

			if (swapResult.error) {
				console.log(swapResult.error);
			} else {
				console.log(
					`https://explorer.solana.com/tx/${swapResult.txid}`,
				);
				console.log(
					`inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`,
				);
				console.log(
					`inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`,
				);
			}
		} catch (error) {
			throw error;
		}
	};

	async function getJupObject() {
		// const connection = new Connection(
		// 	'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5',
		// );
		const connection = new Connection(
			'https://solana-api.projectserum.com',
		);

		let mnemonic = await SecureStore.getItemAsync(passcode);
		const seed = await mnemonicToSeed(mnemonic);
		const fromWallet = accountFromSeed(seed, 0, 'bip44', 0);

		const jupiter = await Jupiter.load({
			connection,
			cluster: 'mainnet-beta',
			user: fromWallet, // or public key
		});

		return jupiter;
	}

	async function getTokens() {
		const tokens: Token[] = await (
			await fetch(TOKEN_LIST_URL['mainnet-beta'])
		).json();
		return tokens;
	}

	function addDecimals(number, decimals) {
		let stringNumber = number.toString();
		const length = stringNumber.length;
		if (decimals > length) {
			const difference = decimals - length;
			for (let i = 0; i < difference; i++) {
				stringNumber = '0' + stringNumber;
			}
		}

		const index = stringNumber.length - decimals;

		if (index > 0) {
			stringNumber =
				stringNumber.substring(0, index) +
				'.' +
				stringNumber.substr(index);
		} else {
			stringNumber = '.' + stringNumber;
		}

		const floatNumber = parseFloat(stringNumber);
		return floatNumber;
	}

	async function getPrice(inputMint: string, outPutMint: string, size) {
		const jupiter = await getJupObject();
		setJupiterObject(jupiter);
		const tokens = await getTokens();

		const inputToken = tokens.find((t) => t.address == inputMint);
		let outputToken = tokens.find((t) => {
			let outPutMintAddress = outPutMint;
			if (
				outPutMintAddress ===
				'G79qAryn3Urn4pyJyTSiX6XNz3Zk1epwJbsnLA5Yntz5'
			) {
				outPutMintAddress =
					'So11111111111111111111111111111111111111112';
			}
			return t.address == outPutMintAddress;
		});
		const outPutDecimals = outputToken?.decimals;

		//usdc token
		const usdcToken = tokens.find(
			(t) => t.address == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
		);

		//get usdc price
		const usdcRoutes = await getRoutes({
			jupiter,
			inputToken,
			outputToken: usdcToken,
			inputAmount: 1, // 1 unit in UI
			slippage: 1, // 1% slippage
		});

		//get dollar price and convert it to dollars instead of lamports
		const dollarPrice = usdcRoutes?.routesInfos[0]?.outAmount / 1000000;
		setPrice(dollarPrice);
		const tradeSize = parseFloat(tradeAmount) / dollarPrice;
		setSize(tradeSize);

		//get usdc price of the output token
		const usdcRoutes2 = await getRoutes({
			jupiter,
			inputToken: outputToken,
			outputToken: usdcToken,
			inputAmount: 1, // 1 unit in UI
			slippage: 1, // 1% slippage
		});

		//get dollar price of output token and convert it to dollars instead of lamports
		const dollarPrice2 = usdcRoutes2?.routesInfos[0]?.outAmount / 1000000;
		console.log('dollarPrice2: ', dollarPrice2);
		setOutputDollarPrice(dollarPrice2);

		//get conversion price between tokens
		const routes = await getRoutes({
			jupiter,
			inputToken,
			outputToken,
			inputAmount: tradeSize, // 1 unit in UI
			slippage: 1, // 1% slippage
		});
		console.log('routes: ', routes);

		const bestRoute = routes?.routesInfos[0];
		setBestRoute2(bestRoute);
		console.log('bestRoute: ', bestRoute);
		bestRoute?.getDepositAndFee().then((r) => {
			console.log('deposit and fees', r);
			setFees(r);
		});
		console.log('bestRoute.outAmount: ', bestRoute?.outAmount);
		setOutAmount(addDecimals(bestRoute?.outAmount, outPutDecimals));
		const ratio = bestRoute?.outAmount / bestRoute?.inAmount;
		setDisplayPrice(ratio);
	}

	const submitJupTrade = async () => {
		console.log('best route', bestRoute2);
		console.log('jupiter object', jupiterObject);
		await executeSwap({ jupiter: jupiterObject, route: bestRoute2 }).catch(
			(err) => console.log('eroror', err),
		);
		setModalVisible(false);
		navigation.navigate('Trade Success', { tradeAmount, fromTo });
	};

	useEffect(() => {
		getPrice(fromTo.from.mint, fromTo.to.mint, size);
	}, [fromTo.from.mint, fromTo.to.mint]);

	// useEffect(() => {
	// 	const originalPair = fromTo.to.pairs.filter((pair) =>
	// 		pair.pair.includes(fromTo.from.symbol),
	// 	)[0].pair;

	// 	const pairIsNotOriginal =
	// 		fromTo.from.symbol + '/' + fromTo.to.symbol !== originalPair;

	// 	let marketName;
	// 	if (pairIsNotOriginal) {
	// 		marketName = fromTo.to.symbol + fromTo.from.symbol;
	// 		setSide('buy');
	// 	} else {
	// 		marketName = fromTo.from.symbol + fromTo.to.symbol;
	// 	}

	// 	console.log('marketName: ', marketName);

	// 	fetch(`https://serum-api.bonfida.com/trades/${marketName}`)
	// 		.then((res) => res.json())
	// 		.then((resp) => {
	// 			console.log('marketname', marketName);

	// 			console.log(resp);
	// 			const recentPrice = resp.data[0].price;
	// 			const newPrice = recentPrice * 1.005;
	// 			console.log('newprice', newPrice);
	// 			pairIsNotOriginal
	// 				? setDisplayPrice(1 / newPrice)
	// 				: setDisplayPrice(newPrice);
	// 			setSize(parseFloat(tradeAmount) / newPrice);
	// 			setPrice(newPrice);
	// 			setMarketAddress(resp.data[0].marketAddress);
	// 		})
	// 		.catch((err) => console.log('error ', err));
	// }, []);

	return (
		<Background>
			<View>
				<SubPageHeader backButton>Trade Preview</SubPageHeader>
				<Text
					style={{
						...styles.bigNumber,
						alignSelf: 'center',
						marginVertical: 32,
					}}
				>
					${tradeAmount}
				</Text>
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						borderRadius: 18,
						marginBottom: 16,
					}}
				>
					<View style={{ margin: 16 }}>
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
								Pay
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								{normalizeNumber(size)} {fromTo.from.symbol} ($
								{tradeAmount})
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
								Fees
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								{outAmount
									? `$${normalizeNumber(
											parseFloat(tradeAmount) -
												outAmount * outputDollarPrice,
									  )}`
									: 'loading...'}
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
								Receive
							</Text>
							<Text
								style={{
									...Nunito_Sans.Body_M_SemiBold,
									color: colors.black_one,
								}}
							>
								{outAmount
									? `${normalizeNumber(outAmount)} ${
											fromTo.to.symbol
									  } ($${normalizeNumber(
											outAmount * outputDollarPrice,
									  )})`
									: 'loading...'}
							</Text>
						</View>
					</View>
				</View>
			</View>
			<View
				style={{ marginBottom: 40 }}
				opacity={jupiterObject && bestRoute2 ? 1 : 0.65}
			>
				<ThemeButton
					onPress={() => {
						if (jupiterObject && bestRoute2) {
							Haptics.impactAsync(
								Haptics.ImpactFeedbackStyle.Medium,
							);
							setModalVisible(true);
							submitJupTrade();
						}
					}}
				>
					Submit Trade
				</ThemeButton>
			</View>
			<Modal
				isVisible={modalVisible}
				backdropColor={colors.black_two}
				backdropOpacity={0.35}
				// onBackdropPress={() => setModalVisible(false)}
			>
				<TouchableOpacity
					onPress={() => {
						setModalVisible(false);
					}}
					style={{
						paddingHorizontal: 32,
						paddingBottom: 32,
						paddingTop: 8,
						backgroundColor: '#111111',
						borderRadius: 32,
						width: 194,
						alignItems: 'center',
						alignSelf: 'center',
					}}
				>
					<Image
						source={require('../assets/images/logo_loader.png')}
						style={{ width: 110, height: 114, marginBottom: 2 }}
					/>
					<Text style={styles.loaderLabel}>Submitting...</Text>
				</TouchableOpacity>
			</Modal>
		</Background>
	);
};

const styles = StyleSheet.create({
	loaderLabel: {
		fontFamily: 'AzeretMono_SemiBold',
		color: 'white',
		fontSize: 12,
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

export default memo(TradePreviewScreen);
