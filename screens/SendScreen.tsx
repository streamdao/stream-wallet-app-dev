import React, { memo, useState, useEffect } from 'react';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import {
	Text,
	View,
	Image,
	StyleSheet,
	TouchableOpacity,
	TextInput as TextInputRN,
} from 'react-native';
import { theme } from '../core/theme';
import Modal from 'react-native-modal';
const {
	colors,
	fonts: { Azeret_Mono, Nunito_Sans },
} = theme;
import { accountFromSeed, mnemonicToSeed } from '../utils/index';
import { SubPageHeader } from '../components';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Wallet } from '@project-serum/anchor';
import { Account, Connection, PublicKey, Keypair } from '@solana/web3.js';
import {
	findAssociatedTokenAddress,
	getAccountFromSeed,
	DERIVATION_PATH,
	normalizeNumber,
	deriveSeed2,
} from '../utils';
import * as SecureStore from 'expo-secure-store';
// import * as ed25519 from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { utils } from 'ethers';
var crypto = require('crypto');
var bip39 = require('bip39');
import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import * as spl from 'easy-spl';
import * as Haptics from 'expo-haptics';
import { BarCodeScanner } from 'expo-barcode-scanner';

type Props = {
	navigation: Navigation;
	route: Object;
};

const SendScreen = ({ navigation, route }: Props) => {
	const token = route.params;
	const [modalVisible, setModalVisible] = useState(false);
	const [tradeAmount, setTradeAmount] = useState('0');
	const [recipientAddress, setRecipientAddress] = useState('');
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const allTokens = useStoreState((state) => state.allTokens);
	const [filteredTo, setFilteredTo] = useState('');
	const passcode = useStoreState((state) => state.passcode);
	const selectedWallet = useStoreState(
		(state) => state.selectedWallet,
		(prev, next) => prev.selectedWalle === next.selectedWallet,
	);
	const [scanned, setScanned] = useState(false);
	const [hasPermission, setHasPermission] = useState(null);

	// async function findAssociatedTokenAddress(
	// 	walletAddress: PublicKey,
	// 	tokenMintAddress: PublicKey,
	// ): Promise<PublicKey> {
	// 	return (
	// 		await PublicKey.findProgramAddress(
	// 			[
	// 				walletAddress.toBuffer(),
	// 				TOKEN_PROGRAM_ID.toBuffer(),
	// 				tokenMintAddress.toBuffer(),
	// 			],
	// 			SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	// 		)
	// 	)[0];
	// }

	async function getPermission() {
		const { status } = await BarCodeScanner.requestPermissionsAsync();
		console.log('status: ', status);
		setHasPermission(status === 'granted');
	}

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);
		alert(`Bar code with type ${type} and data ${data} has been scanned!`);
	};

	async function transferStuff() {
		const url =
			'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5';
		const connection = new Connection(url);

		let mnemonic = await SecureStore.getItemAsync(passcode);
		const seed = await mnemonicToSeed(mnemonic);
		const fromWallet = accountFromSeed(seed, 0, 'bip44', 0);
		const toWallet = new PublicKey(recipientAddress);
		const easySPLWallet = spl.Wallet.fromKeypair(connection, fromWallet);

		console.log('price', token.price);

		if (token.mint === 'So11111111111111111111111111111111111111112') {
			const transaction = new web3.Transaction().add(
				web3.SystemProgram.transfer({
					fromPubkey: fromWallet.publicKey,
					toPubkey: toWallet,
					lamports: web3.LAMPORTS_PER_SOL / 100,
				}),
			);

			// Sign transaction, broadcast, and confirm
			const signature = await web3.sendAndConfirmTransaction(
				connection,
				transaction,
				[fromWallet],
			);
			return console.log('SIGNATURE', signature);
		}
		// create accounts and wallets

		// Construct my token class
		var myMint = new web3.PublicKey(token.mint);

		let transferAmount;
		if (token.price > 0) {
			transferAmount = parseFloat(tradeAmount) / token.price;
		} else {
			transferAmount = parseFloat(tradeAmount);
		}

		console.log('transferAmount: ', transferAmount);

		const result = await easySPLWallet
			.transferToken(myMint, toWallet, transferAmount)
			.catch((err) => console.log(err));

		if (result) {
			setModalVisible(false);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			navigation.navigate('Send Success', {
				toWallet: toWallet.toString('hex'),
				tradeAmount,
				transferAmount,
				token,
			});
		}
	}

	async function initiateTransfer() {
		const url = 'https://solana-api.projectserum.com';
		const connection = new Connection(url);

		let mnemonic = await SecureStore.getItemAsync(passcode);
		const seed = await mnemonicToSeed(mnemonic);
		const account = accountFromSeed(seed, 0, 'bip44', 0);

		const wallet = new Wallet(account);

		transfer(
			token.mint,
			wallet,
			recipientAddress,
			connection,
			parseFloat(tradeAmount),
		);
	}

	async function transfer(
		tokenMintAddress: string,
		wallet,
		to: string,
		connection: web3.Connection,
		amount: number,
	) {
		const mintPublicKey = new web3.PublicKey(tokenMintAddress);
		const mintToken = new Token(
			connection,
			mintPublicKey,
			TOKEN_PROGRAM_ID,
			wallet.secretKey, // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
		);

		const fromTokenAccount = await mintToken
			.getOrCreateAssociatedAccountInfo(wallet.publicKey)
			.catch((err) => console.log('errorrr', err));
		console.log('fromTokenAccount: ', fromTokenAccount);

		const destPublicKey = new web3.PublicKey(to);
		console.log('destPublicKey: ', destPublicKey);

		// Get the derived address of the destination wallet which will hold the custom token
		const associatedDestinationTokenAddr =
			await Token.getAssociatedTokenAddress(
				mintToken.associatedProgramId,
				mintToken.programId,
				mintPublicKey,
				destPublicKey,
			);

		console.log(
			'associatedDestinationTokenAddr: ',
			associatedDestinationTokenAddr,
		);
		const receiverAccount = await connection.getParsedAccountInfo(
			destPublicKey,
		);
		console.log('receiverAccount: ', receiverAccount);

		const instructions: web3.TransactionInstruction[] = [];

		if (receiverAccount === null) {
			instructions.push(
				Token.createAssociatedTokenAccountInstruction(
					mintToken.associatedProgramId,
					mintToken.programId,
					mintPublicKey,
					associatedDestinationTokenAddr,
					destPublicKey,
					wallet.publicKey,
				),
			);
		}

		instructions.push(
			Token.createTransferInstruction(
				TOKEN_PROGRAM_ID,
				token.associatedTokenAddress,
				associatedDestinationTokenAddr,
				wallet.publicKey,
				[],
				amount,
			),
		);
		console.log('instructions: ', instructions);

		const transaction = new web3.Transaction().add(...instructions);
		console.log('transaction: ', transaction);
		transaction.feePayer = wallet.publicKey;
		console.log('transaction.feePayer: ', transaction.feePayer);
		transaction.recentBlockhash = (
			await connection.getRecentBlockhash()
		).blockhash;
		console.log(
			'transaction.recentBlockhash: ',
			transaction.recentBlockhash,
		);

		console.log('connection: ', connection);
		console.log('transaction: ', transaction);
		console.log('wallet: ', wallet);
		var signature = await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[wallet._keypair],
		);
		console.log('signature: ', signature);

		// const transactionSignature = await connection
		// 	.sendRawTransaction(transaction.serialize(), {
		// 		skipPreflight: true,
		// 	})
		// 	.catch((err) => console.log('erororor', err));
		// console.log('transactionSignature: ', transactionSignature);

		await connection.confirmTransaction(signature);

		navigation.navigate('Send Success', {
			tradeAmount,
			token,
			recipientAddress,
		});
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

	function renderSubtext() {
		if (token.price === 0) {
			return `${token.amount} ${token.symbol} available`;
		}
		return `$${normalizeNumber(token.amount * token.price)} available`;
	}

	return (
		<Background dismissKeyboard={true}>
			<SubPageHeader subText={renderSubtext()} backButton>
				Send {token.name}{' '}
			</SubPageHeader>
			{console.log('token price: ', token.price)}
			<View>
				<Text style={{ ...styles.bigNumber, alignSelf: 'center' }}>
					{token.price > 0 ? `$${tradeAmount}` : tradeAmount}
				</Text>
			</View>
			<View
				style={{
					height: 64,
					borderWidth: 1,
					borderColor: theme.colors.black_seven,
					borderRadius: 18,
					padding: 16,
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<Image
					source={require('../assets/icons/wallet_plain.png')}
					style={{ width: 24, height: 24, marginRight: 8 }}
				/>

				<TextInputRN
					style={{
						borderColor: 'black',
						borderWidth: 0,
						...theme.fonts.Nunito_Sans.Body_M_Regular,
						flex: 1,
					}}
					onChangeText={(text: string) => setRecipientAddress(text)}
					value={recipientAddress}
					placeholder="Recipient's Wallet Address"
					keyboardType="default"
				/>
			</View>
			{/* <TouchableOpacity
				onPress={() => {
					navigation.navigate('QR Scan');
				}}
			>
				<Text>Test</Text>
			</TouchableOpacity> */}
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
			<View style={{ marginBottom: 40 }}>
				<ThemeButton
					onPress={() => {
						if (tradeAmount !== '0' && recipientAddress !== '') {
							Haptics.impactAsync(
								Haptics.ImpactFeedbackStyle.Medium,
							);
							setModalVisible(true);
							transferStuff();
						}
					}}
				>
					Send ${tradeAmount}
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
					<Text style={styles.loaderLabel}>Sending...</Text>
				</TouchableOpacity>
			</Modal>
		</Background>
	);
};

const styles = StyleSheet.create({
	absoluteFillObject: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
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
	loaderLabel: {
		fontFamily: 'AzeretMono_SemiBold',
		color: 'white',
		fontSize: 12,
	},
});

export default memo(SendScreen);
