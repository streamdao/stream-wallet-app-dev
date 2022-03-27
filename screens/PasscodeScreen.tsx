import React, { memo, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Background, SubPageHeader } from '../components';
import { Navigation } from '../types';
import {
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	DevSettings,
} from 'react-native';
import { theme } from '../core/theme';
const {
	colors,
	fonts: { Nunito_Sans },
} = theme;
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import * as Serum from '@project-serum/anchor';
import { Jupiter, TOKEN_LIST_URL } from '@jup-ag/core';
import { Wallet } from '@project-serum/anchor';
import {
	Account,
	Connection,
	PublicKey,
	Keypair,
	Transaction,
	TransactionSignature,
} from '@solana/web3.js';
import * as walletAdapter from '@solana/wallet-adapter-base';
import { accountFromSeed, mnemonicToSeed } from '../utils/index';

type Props = {
	navigation: Navigation;
	route: Object;
};

const PassCodeScreen = ({ navigation, route }: Props) => {
	const [code, setCode] = useState('');
	const updatePasscode = useStoreActions((actions) => actions.updatePasscode);
	const passcode = useStoreState((state) => state.passcode);
	const [error, setError] = useState(false);
	const tokenMap = useStoreState((state) => state.tokenMap);
	const setTokenMap = useStoreActions((actions) => actions.setTokenMap);
	const setAllTokens = useStoreActions((actions) => actions.setAllTokens);
	const tokenPairs = useStoreState((state) => state.tokenPairs);
	const setTokenPairs = useStoreActions((actions) => actions.setTokenPairs);
	const setWeb3Connection = useStoreActions(
		(actions) => actions.web3Connection,
	);

	async function checkLocalPasscode(passcodeKey: string, code: string) {
		let result = await SecureStore.getItemAsync(passcodeKey);
		if (result === code) {
			updatePasscode(code);
			const mnemonic = await SecureStore.getItemAsync(code);
			if (mnemonic) {
				Haptics.notificationAsync(
					Haptics.NotificationFeedbackType.Success,
				);
				navigation.navigate('Main');
			} else {
				navigation.navigate('Onboarding');
			}
		} else {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			setError(true);
			setCode('');
		}
	}

	// async function logout() {
	// 	console.warn('hit');
	// 	const passcodeKey = passcode + 'key';
	// 	await SecureStore.deleteItemAsync(passcodeKey);
	// 	console.warn('hit1');
	// 	await SecureStore.deleteItemAsync(passcode);
	// 	console.warn('hit2');
	// 	await AsyncStorage.removeItem('hasAccount');
	// 	console.warn('hit3');
	// 	DevSettings.reload();
	// }

	// const getJupRoutes = async () => {
	// 	console.log('hello');
	// 	const connection = new Connection(
	// 		'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5',
	// 	);

	// 	const tokens = await (
	// 		await fetch(TOKEN_LIST_URL['mainnet-beta'])
	// 	).json();
	// 	console.log(tokens[0].logoURI);
	// 	console.log(tokens[10].logoURI);
	// 	console.log(tokens[40].logoURI);
	// 	console.log(tokens[200].logoURI);
	// 	console.log(tokens[300].logoURI);
	// 	console.log(tokens[400].logoURI);
	// 	console.log(tokens[500].logoURI);
	// 	console.log(tokens[1000].logoURI);
	// 	setAllTokens(tokens);
	// };

	// useEffect(() => {
	// 	getJupRoutes();
	// }, [tokenMap]);

	function getTokenPairs() {
		//get a clean list of all symbols in Bonfida (remove all the perps ones), dedupe them, then grab their symbols, then grab their pairs, then list if it's buy side or sell side for each one

		//then make two big calls to Coinmarketcap - one for data, the other for price
		//then combine all of those results based on symbol name 🎉
		return fetch('https://serum-api.bonfida.com/pairs')
			.then((res) => res.json())
			.then((res) => {
				const removedPools = res.data.filter(
					(value) =>
						![
							'-',
							'LQID',
							'ODOP',
							'xCOPE',
							'CCAI',
							'PLEB',
							'BVOL',
							'POOL',
							'BTC/SRM',
							'FTT/SRM',
							'YFI/SRM',
							'SUSHI/SRM',
							'ETH/SRM',
							'RAY/SRM',
							'RAY/ETH',
							'MSRM',
						].some((el) => value.includes(el)),
				);

				//split the pairs into separate symbols
				const symbolsArray = [];
				for (let i = 0; i < removedPools.length; i++) {
					const el = removedPools[i];
					const splitArray = el.split('/');
					symbolsArray.push(...splitArray);
				}

				//dedupe symbols
				const dedupedSymbols = [...new Set(symbolsArray)];

				//remove random hashes
				const cleanArray = [];
				for (let i = 0; i < dedupedSymbols.length; i++) {
					const el = dedupedSymbols[i];
					if (el.length < 15) {
						cleanArray.push(el);
					}
				}

				const finishedArray = [];
				for (let i = 0; i < cleanArray.length; i++) {
					const el = cleanArray[i];

					//find matching pairs
					const pairs = removedPools.filter(
						(str: string) => str.indexOf(el) >= 0,
					);
					const pairsArray = [];
					for (let i = 0; i < pairs.length; i++) {
						const el2 = pairs[i];

						//take away the name and slash
						const removeSymbol = el2.replace(el, '');
						const removeSlash = removeSymbol.replace('/', '');

						//deduce whether sell or buy side
						let side;
						removeSlash === el2.slice(0, removeSlash.length)
							? (side = 'buy')
							: (side = 'sell');

						//construct array object
						const newPair = {
							pair: el2,
							symbol: removeSlash,
							side: side,
						};

						pairsArray.push(newPair);
					}

					const finishedObject = {
						symbol: el,
						pairs: pairsArray,
					};

					finishedArray.push(finishedObject);
				}
				setTokenPairs(finishedArray);
			})
			.catch((err) => console.log(err));
	}

	async function setupWeb3() {
		const url =
			'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5';
		const connection = new Connection(url);
		setWeb3Connection(connection);
	}

	useEffect(() => {
		getTokenPairs();
		new TokenListProvider().resolve().then((tokens) => {
			const tokenList = tokens
				.filterByClusterSlug('mainnet-beta')
				.getList();

			setTokenMap(
				tokenList?.reduce((map, item) => {
					map.set(item.address, item);
					return map;
				}, new Map()),
			);
		});
	}, []);

	useEffect(() => {
		// logout();
		if (code.length === 4) {
			const passcodeKey = code + 'key';
			checkLocalPasscode(passcodeKey, code);
		}
		if (code.length === 1) {
			setError(false);
		}
	}, [code]);

	function addNumber(numberString: string) {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (code.length < 4) {
			if (code === '0') {
				const replaceZero = code.slice(0, -1);
				const newAmount = replaceZero.concat(numberString);
				setCode(newAmount);
			} else {
				const newAmount = code.concat(numberString);
				setCode(newAmount);
			}
		}
	}

	function removeNumber() {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (code.length === 1) {
			setCode('');
		} else {
			const newAmount = code.slice(0, -1);
			setCode(newAmount);
		}
	}

	return (
		<Background blackBackground={true}>
				<Image
					source={require('../assets/images/logo_passcode.png')}
					style={{
						width: 120,
						height: 124,
						alignSelf: 'center',
						marginTop: 64,
					}}
				/>

				<View
					style={{
						flexDirection: 'row',
						width: 160,
						justifyContent: 'space-between',
						alignSelf: 'center',
					}}
				>
					<View
						style={code.length >= 1 ? styles.filled : styles.outlined}
					/>
					<View
						style={code.length >= 2 ? styles.filled : styles.outlined}
					/>
					<View
						style={code.length >= 3 ? styles.filled : styles.outlined}
					/>
					<View
						style={code.length >= 4 ? styles.filled : styles.outlined}
					/>
				</View>
				{error ? (
					<Text
						style={{
							...Nunito_Sans.Body_M_Regular,
							color: 'white',
							opacity: 0.75,
							alignSelf: 'center',
						}}
					>
						Incorrect passcode, try again.
					</Text>
				) : null}

				<View style={{ marginBottom: 40 }}>
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
						<View style={styles.numberContainer}>
							<Text style={styles.mediumNumber}></Text>
						</View>
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
								source={require('../assets/icons/arrow-left-big-green.png')}
								style={{ width: 40, height: 40 }}
							/>
						</TouchableOpacity>
					</View>
				</View>	
		</Background>
	);
};

const styles = StyleSheet.create({
	tableLabel: {
		fontSize: 14,
		color: '#727D8D',
	},
	outlined: {
		width: 16,
		height: 16,
		borderRadius: 1000,
		borderWidth: 1,
		borderColor: colors.accent,
	},
	filled: {
		width: 16,
		height: 16,
		borderRadius: 1000,
		// borderWidth: 1,
		backgroundColor: colors.accent,
	},
	tableData: {
		fontSize: 17,
		color: colors.primary,
	},
	bigNumber: {
		fontSize: 84,
		fontFamily: 'NunitoSans_Regular',
		// fontWeight: '400',
		color: colors.black_two,
	},
	mediumNumber: {
		fontSize: 48,
		fontFamily: 'NunitoSans_Regular',
		// fontWeight: '400',
		color: colors.accent,
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

export default memo(PassCodeScreen);
