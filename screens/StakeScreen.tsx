import React, { memo, useState, useEffect } from 'react';
import { Background, Button } from '../components';
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

type Props = {
	navigation: Navigation;
	route: Object;
};

const StakeScreen = ({ navigation, route }: Props) => {
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

	function stakeAmountPercentage(percentage: float) {
		const realPercent = percentage / 100;
		const availableAmount = token.amount * token.price;
		const newAmount = normalizeNumber(availableAmount * realPercent);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setTradeAmount(newAmount);
	}

	return (
		<Background dismissKeyboard={true}>
			<SubPageHeader subText={renderSubtext()} backButton>
				Stake {token.name}{' '}
			</SubPageHeader>
			{console.log('token price: ', token.price)}
			<View>
				<Text style={{ ...styles.bigNumber, alignSelf: 'center' }}>
					{token.price > 0 ? `$${tradeAmount}` : tradeAmount}
				</Text>
			</View>
			<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
				<TouchableOpacity
					style={styles.percentButton}
					onPress={() => stakeAmountPercentage(25)}
				>
					<Text>25%</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.percentButton}
					onPress={() => stakeAmountPercentage(50)}
				>
					<Text>50%</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.percentButton}
					onPress={() => stakeAmountPercentage(100)}
				>
					<Text>100%</Text>
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
			<View style={{ marginBottom: 40 }}>
				<Button
					onPress={() => {
						if (tradeAmount !== '0') {
							Haptics.impactAsync(
								Haptics.ImpactFeedbackStyle.Medium,
							);
							navigation.navigate('Stake Preview', {
								tradeAmount,
								price: token.price,
							});
						}
					}}
				>
					Preview Stake
				</Button>
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
	tableLabel: {
		fontSize: 14,
		color: '#727D8D',
	},
	percentButton: {
		height: 40,
		width: 65,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: theme.colors.black_six,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
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

export default memo(StakeScreen);
