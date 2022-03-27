import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import {
	Text,
	ScrollView,
	StyleSheet,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Background, ThemeButton, DashboardLoading } from '../components';
import { Button } from 'react-native-paper';
import { Navigation } from '../types';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';
import { AreaChart, Path } from 'react-native-svg-charts';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import * as shape from 'd3-shape';
import { SubPageHeader } from '../components';
import { theme } from '../core/theme';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import { Account, Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Market } from '@project-serum/serum';
import {
	findAssociatedTokenAddress,
	getAccountFromSeed,
	DERIVATION_PATH,
	normalizeNumber,
	shortenPublicKey,
	copyToClipboard,
	getSubWalletsData,
	getOwnedTokensData,
	getAllTokensData,
	settleFundsData,
	getActiveSubWalletTokens,
	getOwnedNftsData,
} from '../utils';
import { derivePath } from 'ed25519-hd-key';
import TokenCard from '../components/TokenCard';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import * as SecureStore from 'expo-secure-store';
import Modal from 'react-native-modal';
import { Wallet } from '@project-serum/anchor';
import { Jupiter } from '@jup-ag/core';
import { accountFromSeed, mnemonicToSeed } from '../utils/index';
import Storage from '../storage';
import { useFocusEffect } from '@react-navigation/core';
import NFTcard from '../components/NFTcard';
import { Snackbar } from 'react-native-paper';
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import { myNFTsScreen } from '.';

type Props = {
	navigation: Navigation;
};

const DashboardScreen2 = ({ navigation }: Props) => {
	const [copied, setCopied] = useState('');
	const [chartData, setChartData] = useState('');
	const [modalVisible, setModalVisible] = useState(true);
	const [account, setAccount] = useState('');
	const [connection, setConnection] = useState('');
	const [tokens, setTokens] = useState('');
	const [loading, setLoading] = useState(true);
	const tokenMap = useStoreState((state) => state.tokenMap);
	const [tokenMapSymbols, setTokenMapSymbols] = useState<
		Map<string, TokenInfo>
	>(new Map());
	const passcode = useStoreState((state) => state.passcode);
	const allTokens = useStoreState((state) => state.allTokens);
	const setAllTokens = useStoreActions((actions) => actions.setAllTokens);
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const setOwnedTokens = useStoreActions((actions) => actions.setOwnedTokens);
	const setFirstLoadedTokens = useStoreActions(
		(actions) => actions.setFirstLoadedTokens,
	);
	const selectedWallet = useStoreState(
		(state) => state.selectedWallet,
		(prev, next) => prev.selectedWallet === next.selectedWallet,
	);
	const setSelectedWallet = useStoreActions(
		(actions) => actions.setSelectedWallet,
	);
	const subWallets = useStoreState((state) => state.subWallets);
	const setSubWallets = useStoreActions((actions) => actions.setSubWallets);
	const subWalletNftsArray = useStoreState(
		(state) => state.subWalletNftsArray,
	);
	const setSubWalletNftsArray = useStoreActions(
		(actions) => actions.setSubWalletNftsArray,
	);
	const subWalletTokensArray = useStoreState(
		(state) => state.subWalletTokensArray,
	);
	const setSubWalletTokensArray = useStoreActions(
		(actions) => actions.setSubWalletTokensArray,
	);
	const tokenPairs = useStoreState((state) => state.tokenPairs);

	const [sortedTokens, setSortedTokens] = useState(tokens);
	const activeSubWallet = useStoreState(
		(state) => state.activeSubWallet,
		(prev, next) => prev.activeSubWallet === next.activeSubWallet,
	);
	const setActiveSubWallet = useStoreActions(
		(actions) => actions.setActiveSubWallet,
	);

	const previousActiveSubWallet = useRef(0);

	const myContext = useContext(AppContext);

	const [ownedTokensHasRendered, setOwnedTokensHasRendered] = useState(false);

	const [snackIsVisible, setSnackIsVisible] = useState(false);

	const onToggleSnackBar = () => setSnackIsVisible(true);

	const onDismissSnackBar = () => setSnackIsVisible(false);

	function sortTokens(tokens) {
		const sortedTokens = tokens.sort((a, b) => {
			return b.price * b.amount - a.price * a.amount;
		});
		setSortedTokens(sortedTokens);
	}

	useEffect(() => {
		if (tokens) {
			sortTokens(tokens);
		}
	}, [tokens]);

	//chart stuff
	const Line = ({ line }) => (
		<Path key={'line'} d={line} stroke={'black'} fill={'none'} />
	);

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

	async function getSubWallets() {
		let result = await getSubWalletsData(passcode);
		setSubWallets(result);
	}

	async function getActiveSubWalletOwnedTokens() {
		const tokens = await getActiveSubWalletTokens(
			activeSubWallet,
			passcode,
			tokenMap,
			tokenPairs,
		);
		setFirstLoadedTokens(tokens);
		setTokens(tokens);
		let todayArray = [];
		let d30Array = [];
		let d60Array = [];
		let d90Array = [];
		tokens.forEach((token) => {
			todayArray.push(token.price * token.amount);
			d30Array.push(token.price_30d * token.amount);
			d60Array.push(token.price_60d * token.amount);
			d90Array.push(token.price_90d * token.amount);
		});
		let sumToday = 0;
		for (let i = 0; i < todayArray.length; i++) {
			sumToday += todayArray[i];
		}

		let sum30 = 0;
		for (let i = 0; i < d30Array.length; i++) {
			sum30 += d30Array[i];
		}
		let sum60 = 0;
		for (let i = 0; i < d60Array.length; i++) {
			sum60 += d60Array[i];
		}
		let sum90 = 0;
		for (let i = 0; i < d90Array.length; i++) {
			sum90 += d90Array[i];
		}

		const today = setChartData([sum90, sum60, sum30, sumToday]);
		setLoading(false);
	}

	async function getOwnedTokens() {
		let result = await getOwnedTokensData(
			subWallets,
			passcode,
			tokenMap,
			tokenPairs,
		);
		setSubWalletTokensArray(result.tokensBySubWallet);
		//deal with setAccount(newAccountArray)
	}

	async function getAllTokens() {
		let result = await getAllTokensData(tokenMapSymbols, tokenPairs);
		setAllTokens(result);
	}

	async function getOwnedNfts() {
		let result = await getOwnedNftsData(
			subWallets[activeSubWallet].publicKey,
		);
		setSubWalletNftsArray(result);
	}

	// async function settleFunds() {
	// 	let result = await settleFundsData(account, Market, connection);

	// }

	function populateDashboard() {
		//console.log('popDash')
		let todayTotal;
		let percentChangeFixed;
		if (tokens && tokens.length > 0) {
			const totals = tokens?.map((item) => {
				return item.amount * item.price;
			});

			todayTotal = totals?.reduce((prev, current) => prev + current);
			const yesterdayTotals = tokens?.map((item) => {
				const change = item.percent_change_24h * 0.01;
				let multiplier = 1 - change;
				const total = item.amount * item.price;
				const yesterday = total * multiplier;

				return yesterday;
			});

			const yesterdayTotal = yesterdayTotals?.reduce(
				(prev, current) => prev + current,
			);

			let percentChange1 =
				((todayTotal - yesterdayTotal) / todayTotal) * 100;
			percentChangeFixed = percentChange1.toFixed(1);
		}
		return {
			totalBalance: normalizeNumber(todayTotal),
			percentChange: percentChangeFixed,
		};
	}

	function getSOL(tokens) {
		const sol = tokens.find((token: object) => {
			if (token.symbol === 'SOL') {
				return token;
			}
		});
		return sol;
	}

	useEffect(() => {
		if (subWalletTokensArray) {
			if (subWalletTokensArray[activeSubWallet]) {
				setOwnedTokens(subWalletTokensArray[activeSubWallet]);
			}
		}
	}, [subWalletTokensArray, activeSubWallet]);

	useEffect(() => {
		if (tokens) {
			getAllTokens();
		}
		if (!subWallets) {
			getSubWallets();
		}
		getOwnedNfts();
	}, [tokens]);

	useEffect(() => {
		if (tokenMap && !tokens) {
			console.warn('hit selected wallet');
			getActiveSubWalletOwnedTokens();
		}
	}, [tokenMap]);

	useEffect(() => {
		if (tokenMap && subWallets && tokens && !ownedTokensHasRendered) {
			getOwnedTokens();
			setOwnedTokensHasRendered(true);
		}
	}, [tokenMap, subWallets, tokens]);

	useEffect(() => {
		new TokenListProvider().resolve().then((tokens) => {
			const tokenList = tokens
				.filterByClusterSlug('mainnet-beta')
				.getList();

			setTokenMapSymbols(
				tokenList?.reduce((map, item) => {
					map.set(item.symbol, item);
					return map;
				}, new Map()),
			);
		});
	}, []);

	useEffect(() => {
		if (previousActiveSubWallet.current !== myContext.globalActiveWallet) {
			populateDashboard();
			getActiveSubWalletOwnedTokens();
			previousActiveSubWallet.current = myContext.globalActiveWallet;
		}
	}, [myContext.globalActiveWallet]);

	if (!loading && tokens.length === 0 && account) {
		return (
			<Background>
				<ScrollView showsVerticalScrollIndicator={false}>
					<SubPageHeader backButton={false}>Dashboard</SubPageHeader>
					<View
						style={{
							// borderColor: theme.colors.border,
							borderWidth: 1,
							borderRadius: 18,
							padding: 16,
							marginBottom: 16,
							backgroundColor: theme.colors.black_one,
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
									source={require('../assets/icons/wallet_green.png')}
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
											...theme.fonts.Nunito_Sans
												.Body_M_Bold,
											color: 'white',
											paddingRight: 16,
										}}
									>
										Send tokens to your wallet to get
										started
									</Text>
									<Text
										style={{
											...theme.fonts.Nunito_Sans
												.Caption_M_SemiBold,
											color: theme.colors.black_six,
										}}
									>
										Start by copying your Wallet Address
									</Text>
									<Text
										style={{
											...theme.fonts.Nunito_Sans
												.Caption_M_SemiBold,
											color: theme.colors.black_six,
										}}
									>
										(
										{shortenPublicKey(
											subWallets[
												activeSubWallet
											].publicKey.toString('hex'),
											0,
											8,
											-8,
										)}
										)
									</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								borderTopColor: theme.colors.black_six,
								borderTopWidth: 1,
								marginVertical: 16,
							}}
						/>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => {
								copyToClipboard(
									subWallets[
										activeSubWallet
									].publicKey.toString('hex'),
								);
								onToggleSnackBar();
							}}
						>
							<Text
								style={{
									...theme.fonts.Nunito_Sans.Body_M_Bold,
									color: '#668290',
									marginRight: 4,
								}}
							>
								Copy Wallet Address
							</Text>
						</TouchableOpacity>
					</View>
					<View
						style={{
							borderTopColor: theme.colors.black_six,
							borderTopWidth: 1,
							marginVertical: 16,
						}}
					/>
					<View style={{ alignItems: 'center', padding: 24 }}>
						<Image
							source={require('../assets/icons/chart_logo_small.png')}
							style={{ width: 40, height: 40, marginBottom: 16 }}
						/>
						<Text style={{ color: theme.colors.black_four }}>
							No tokens belong to this address.
						</Text>
					</View>
				</ScrollView>
				<View
					style={{
						justifyContent: 'center',
						marginBottom: 8,
						marginHorizontal: -8,
					}}
				>
					<Snackbar
						visible={snackIsVisible}
						onDismiss={onDismissSnackBar}
						theme={{ colors: { accent: '#FFFFFF' } }}
						action={{
							label: '',
							onPress: async () => {
								setSnackIsVisible(false);
							},
							icon: () => (
								<Image
									source={require('../assets/icons/close_white.png')}
									style={{
										width: 14,
										height: 14,
										marginRight: 4,
										marginLeft: 85,
										marginVertical: 4,
									}}
								/>
							),
						}}
						style={{
							borderRadius: 18,
							height: 56,
							alignSelf: 'stretch',
							backgroundColor: '#1E2122',
							justifyContent: 'center',
						}}
					>
						<Text
							style={{
								color: '#FFFFFF',
								...theme.fonts.Nunito_Sans.Caption_M_SemiBold,
							}}
						>
							Address Copied!
						</Text>
					</Snackbar>
				</View>
			</Background>
		);
	}

	if (loading) {
		return (
			<Background>
				<SubPageHeader backButton={false}>Dashboard</SubPageHeader>
				<View
					style={{
						borderWidth: 1,
						borderRadius: 18,
						borderColor: theme.colors.border,
						padding: 16,
					}}
				>
					<View
						style={{
							width: 140,
							height: 20,
							borderRadius: 4,
							backgroundColor: theme.colors.black_seven,
							marginBottom: 24,
						}}
					/>
					<View style={{ flexDirection: 'row' }}>
						<View
							style={{
								width: 70,
								height: 32,
								borderRadius: 4,
								backgroundColor: theme.colors.black_seven,
								marginRight: 16,
							}}
						/>
						<View
							style={{
								width: 85,
								height: 20,
								borderRadius: 4,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
					<View style={{ marginVertical: 48 }}>
						<ActivityIndicator />
					</View>
				</View>
				<View style={{ marginTop: 24, marginBottom: 8 }}>
					<Text
						style={{
							marginBottom: 8,
							...theme.fonts.Azeret_Mono.Body_M_SemiBold,
						}}
					>
						Portfolio
					</Text>

					<DashboardLoading />
				</View>
			</Background>
		);
	}

	const SOL = getSOL(tokens);

	return (
		<Background>
			<ScrollView showsVerticalScrollIndicator={false}>
				<SubPageHeader backButton={false}>Dashboard</SubPageHeader>
				{/* {SOL ? (
					<View
						style={{
							// borderColor: theme.colors.border,
							borderWidth: 1,
							borderRadius: 18,
							padding: 16,
							marginBottom: 16,
							backgroundColor: theme.colors.black_one,
						}}
					>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
							onPress={() => navigation.navigate('Stake', SOL)}
						>
							<View style={{ flexDirection: 'row' }}>
								<Image
									source={require('../assets/icons/green_trophy.png')}
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
											...theme.fonts.Nunito_Sans
												.Body_M_Bold,
											color: 'white',
											paddingRight: 16,
										}}
									>
										Earn interest on your SOL
									</Text>
									<Text
										style={{
											...theme.fonts.Nunito_Sans
												.Caption_M_SemiBold,
											color: theme.colors.black_six,
										}}
									>
										Earn 8% interest for holding
									</Text>
								</View>
							</View>
							<Image
								source={require('../assets/icons/Chevron_Up_White.png')}
								style={{
									width: 24,
									height: 24,
									borderRadius: 100,
									marginRight: 16,
								}}
							/>
						</TouchableOpacity>
					</View>
				) : null} */}
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						backgroundColor: 'white',
						borderRadius: 18,
						padding: 16,
					}}
				>
					<Text
						style={{
							marginVertical: 8,
							...theme.fonts.Azeret_Mono.Body_M_SemiBold,
						}}
					>
						Portfolio Value
					</Text>
					<View
						style={{ flexDirection: 'row', alignItems: 'flex-end' }}
					>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Header_L_Semibold,
								marginRight: 4,
							}}
						>
							{populateDashboard().totalBalance}
						</Text>
						{populateDashboard().percentChange > 0 ? (
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
									{populateDashboard().percentChange}% Today
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
									{populateDashboard().percentChange}% Today
								</Text>
							</View>
						)}
					</View>
					<AreaChart
						style={{ height: 200 }}
						data={chartData}
						// data={[1, 2, 3, 4]}
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
					</AreaChart>
				</View>
				<View style={{}}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Text
							style={{
								...theme.fonts.Azeret_Mono.Body_M_SemiBold,
								marginTop: 28,
								marginBottom: 14,
								alignItems: 'center',
								paddingTop: 4,
								paddingBottom: 1,
							}}
						>
							My NFTs
						</Text>
						<TouchableOpacity
							style={{ marginTop: 28, marginBottom: 14 }}
							onPress={() => navigation.navigate('NFT Wallet')}
						>
							<Text
								style={{
									...theme.fonts.Nunito_Sans.Body_M_Bold,
									color: theme.colors.black_four,
								}}
							>
								See All
							</Text>
						</TouchableOpacity>
					</View>
					<View>
						<FlatList
							horizontal={true}
							data={subWalletNftsArray}
							renderItem={(nft) => (
								<NFTcard
									nft={nft}
									fullCard={false}
									onPress={() =>
										navigation.navigate(
											'NFT Details',
											nft.index,
										)
									}
								/>
							)}
							keyExtractor={(item) => item.address}
						/>
					</View>
				</View>

				<View style={{}}>
					<Text
						style={{
							...theme.fonts.Azeret_Mono.Body_M_SemiBold,
							marginBottom: 14,
						}}
					>
						My Tokens
					</Text>

					{tokens ? (
						<FlatList
							data={sortedTokens}
							renderItem={(token) => (
								<TokenCard
									token={token}
									onPress={() =>
										navigation.navigate(
											'Token Details',
											token.item,
										)
									}
								/>
							)}
							// renderItem={TokenCard}
							keyExtractor={(item) => item.address}
						/>
					) : null}
				</View>
			</ScrollView>
		</Background>
	);
};

const styles = StyleSheet.create({
	loaderLabel: {
		fontFamily: 'AzeretMono_SemiBold',
		color: 'white',
		fontSize: 12,
	},
});

export default memo(DashboardScreen2);
