import React, { memo, useState, useMemo, useRef, useCallback } from 'react';
import {
	Background,
	Button,
	SubPageHeader,
	Callout,
	ThemeButton,
} from '../components';
import { Navigation } from '../types';
import { theme } from '../core/theme';
import {
	View,
	Text,
	TextInput as TextInputRN,
	Image,
	StyleSheet,
	TouchableWithoutFeedback,
} from 'react-native';
import {
	BottomSheetModal,
	BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';

type Props = {
	navigation: Navigation;
};

const DismissKeyboard = ({ children }) => (
	<TouchableWithoutFeedback onPress={() => console.log('hello')}>
		{children}
	</TouchableWithoutFeedback>
);

const ImportWalletScreen = ({ navigation }: Props) => {
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');
	const [copiedText, setCopiedText] = React.useState('');
	const passcode = useStoreState((state) => state.passcode);

	async function storePhraseAndContinue(passcode: string, phrase: string) {
		await SecureStore.setItemAsync(passcode, phrase);
		navigation.navigate('Main');
	}

	function wordCount(str: string) {
		return str.split(' ').length;
	}
	const copyToClipboard = () => {
		Clipboard.setString('hello world');
	};

	const fetchCopiedText = async () => {
		const text = await Clipboard.getStringAsync();
		setCopiedText(text);
	};

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
				<SubPageHeader backButton={true}>Import Wallet</SubPageHeader>
				<Text
					style={{
						marginVertical: 24,
						...theme.fonts.Nunito_Sans.Body_L_Bold,
					}}
				>
					Add your secret phrase to import your wallet
				</Text>
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.black_seven,
						// padding: 8,
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
						}}
						autoCapitalize="none"
						onChangeText={(text) => setSecret(text)}
						value={secret}
						placeholder={'Enter phrase with a space between words'}
						// placeholderTextColor: theme.colors.primary
						keyboardType="default"
						multiline={true}
						minHeight={100}
					/>
					{/* <View
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
						>
							<Image
								source={require('../assets/icons/scan.jpg')}
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
								Scan
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => fetchCopiedText()}
							style={{
								flexDirection: 'row',
								marginRight: 8,
								padding: 6,
								backgroundColor: '#F1F4F9',
								borderRadius: 6,
							}}
						>
							<Image
								source={require('../assets/icons/copy.jpg')}
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
								sport seek found
							</Text>
						</TouchableOpacity>
					</View> */}
				</View>
				<Callout
					text="Your secret phrase will be encrypted and never leave this device. "
					iconName="shield_small.png"
				/>
				<View style={{ height: 24 }} />
				<TouchableOpacity
					onPress={() => bottomSheetModalRef.current?.present()}
				>
					<Text style={theme.fonts.Nunito_Sans.Body_M_Bold}>
						What is a Secret Phrase?
					</Text>
				</TouchableOpacity>
			</View>
			<View style={{ marginBottom: 40 }}>
				<ThemeButton
					mode="contained"
					onPress={() => storePhraseAndContinue(passcode, secret)}
				>
					Import Wallet
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

export default memo(ImportWalletScreen);
