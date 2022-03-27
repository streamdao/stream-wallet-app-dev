import React, {
	memo,
	useState,
	useMemo,
	useRef,
	useCallback,
	useEffect,
} from 'react';
import { Background, ThemeButton, SubPageHeader } from '../components';
import { Navigation } from '../types';
import { theme } from '../core/theme';
import {
	View,
	Text,
	TextInput as TextInputRN,
	Image,
	StyleSheet,
	TouchableWithoutFeedback,
	Alert,
} from 'react-native';
import {
	BottomSheetModal,
	BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import {
	generateMnemonic,
	mnemonicToSeed,
	copyToClipboard,
	getAccountFromSeed,
	DERIVATION_PATH,
} from '../utils/index';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import Storage from '../storage';

type Props = {
	navigation: Navigation;
};

const CreateWalletScreen = ({ navigation }: Props) => {
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');
	const passcode = useStoreState((state) => state.passcode);
	const setSubWallets = useStoreActions((actions) => actions.setSubWallets);

	async function storePhraseAndContinue(passcode: string, phrase: string) {
		await SecureStore.setItemAsync(passcode, phrase);
		navigation.navigate('Main');
	}

	async function setWallet(mnemonic: string) {
		const seed = await mnemonicToSeed(mnemonic);
		const newAccount = getAccountFromSeed(
			seed,
			0,
			DERIVATION_PATH.bip44Change,
		);
		const { publicKey } = newAccount;
		const walletKey = publicKey.toString('hex');

		await Storage.setItem('firstWalletKey', walletKey);
	}

	async function generatePhrase() {
		const mnemonic = await generateMnemonic();
		setWallet(mnemonic);
		setSecret(mnemonic);
	}

	useEffect(() => {
		generatePhrase();
	}, []);

	// bottomsheet stuff
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ['25%', '50%'], []);
	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);
	const handleSheetChanges = useCallback((index: number) => {
		console.log('handleSheetChanges', index);
	}, []);

	return (
		<Background position="bottom" dismissKeyboard={true}>
			<View>
				<SubPageHeader backButton={true}>Create Wallet</SubPageHeader>
				<Text
					style={{
						marginVertical: 24,
						...theme.fonts.Nunito_Sans.Body_L_Bold,
					}}
				>
					Copy the secret phrase (password) below and store it
					somewhere safe.
				</Text>
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.black_seven,
						borderRadius: 18,
						padding: 16,
						marginBottom: 24,
					}}
				>
					<TextInputRN
						style={{
							borderColor: 'black',
							borderWidth: 0,
							...theme.fonts.Nunito_Sans.Body_M_Regular,
							marginBottom: 8,
						}}
						editable={false}
						onChangeText={(text) => setSecret(text)}
						value={secret}
						placeholder="Enter your secret phrase"
						// placeholderTextColor: theme.colors.primary
						keyboardType="default"
						multiline={true}
						// minHeight={150}
					/>
					<View
						style={{
							borderBottomColor: theme.colors.black_seven,
							borderBottomWidth: 1,
							marginBottom: 8,
						}}
					></View>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								marginRight: 8,
								padding: 6,
								backgroundColor: '#F1F4F9',
								borderRadius: 6,
							}}
							onPress={() =>
								copyToClipboard(secret, 'Secret Phrase')
							}
						>
							<Image
								source={require('../assets/icons/Copy_2.png')}
								style={{
									width: 16,
									height: 16,
									alignSelf: 'center',
									marginRight: 6,
								}}
							/>
							<Text
								style={
									theme.fonts.Nunito_Sans.Caption_S_SemiBold
								}
							>
								Copy
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				{/* <Button
				onPress={handlePresentModalPress}
				title="Present Modal"
				mode="contained"
				// color="black"
			/> */}
				<TouchableOpacity
					onPress={() => bottomSheetModalRef.current?.present()}
				>
					<Text style={theme.fonts.Nunito_Sans.Body_M_Bold}>
						What is a Secret Phrase?
					</Text>
				</TouchableOpacity>
				{/* <View style={{ height: 250 }}></View> */}
			</View>
			<View style={{ marginBottom: 40 }}>
				<ThemeButton
					mode="contained"
					onPress={() => storePhraseAndContinue(passcode, secret)}
				>
					Save & Continue
				</ThemeButton>
			</View>
			<BottomSheetModalProvider>
				<BottomSheetModal
					ref={bottomSheetModalRef}
					index={1}
					snapPoints={snapPoints}
					onChange={handleSheetChanges}
					style={{
						// margin: 16,
						shadowColor: '#000',
						shadowOffset: {
							width: 0,
							height: 6,
						},
						shadowOpacity: 0.37,
						shadowRadius: 7.49,
						elevation: 12,
					}}
				>
					<View
						style={{
							justifyContent: 'space-between',
							margin: 16,
						}}
					>
						<View
							style={{
								marginBottom: 24,
								marginTop: 8,
							}}
						>
							<Text
								style={
									theme.fonts.Azeret_Mono.Header_M_SemiBold
								}
							>
								What is a Secret Phrase?
							</Text>
						</View>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Body_M_SemiBold,
								marginBottom: 16,
							}}
						>
							The secret phrase is like a password, but generated
							programmatically and more secure.
						</Text>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Body_M_SemiBold,
								marginBottom: 16,
							}}
						>
							You should have received it from where you generated
							your wallet and it should be 12-20 words long.
						</Text>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Body_M_SemiBold,
								marginBottom: 16,
							}}
						>
							Be sure to enter it in the exact word order you
							received it with a space between each word.
						</Text>
						<ThemeButton
							onPress={() =>
								bottomSheetModalRef.current?.dismiss()
							}
						>
							{' '}
							I Understand
						</ThemeButton>
					</View>
				</BottomSheetModal>
			</BottomSheetModalProvider>
		</Background>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
		backgroundColor: 'grey',
	},
	contentContainer: {
		flex: 1,
		alignItems: 'center',
	},
});

export default memo(CreateWalletScreen);
