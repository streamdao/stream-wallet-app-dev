import React, { memo, useState, useMemo, useRef, useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Background, ThemeButton, SubPageHeader, RedButton } from '../components';
import { Navigation } from '../types';
import { View, Image } from 'react-native';
import { theme } from '../core/theme';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { shortenPublicKey, copyToClipboard } from '../utils';
import { Snackbar } from 'react-native-paper';

import { useContext } from 'react';
import AppContext from '../components/AppContext';

type Props = {
	navigation: Navigation;
};

const WalletDetailsScreen = ({ navigation }: Props) => {
	const activeSubWallet = useStoreState((state) => state.activeSubWallet);
	const setActiveSubWallet = useStoreActions(
		(actions) => actions.setActiveSubWallet,
	);
	const selectedWallet = useStoreState((state) => state.selectedWallet);
	const finalSubWallets = useStoreState((state) => state.finalSubWallets);
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => [0, '40%'], []);
	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	const handleSheetChanges = useCallback((index: number) => {}, []);

	const myContext = useContext(AppContext);
	const [snackIsVisible, setSnackIsVisible] = useState(false);

	const onToggleSnackBar = () => setSnackIsVisible(true)

	const onDismissSnackBar = () => setSnackIsVisible(false);

	if (finalSubWallets.length === 0) {
		return <Text>Loading...</Text>;
	}

	function updateActiveWallet() {
		setActiveSubWallet(selectedWallet);
		myContext.setGlobalActiveWallet(selectedWallet);
		
	}

	// console.log('active WD', activeSubWallet);
	// console.log('selected WD', selectedWallet);
	// console.log('global', myContext.globalActiveWalletName);
	// myContext.setGlobalActiveWallet(1);
	// console.log('global2', myContext.globalActiveWalletName);
	

	return (
		<Background>
			<View>
				<View style={styles.screenTitle}>
					<SubPageHeader backButton>
						{finalSubWallets[selectedWallet].subWalletName}
					</SubPageHeader>
					{selectedWallet === activeSubWallet && (
						<View
							style={{
								...styles.activeContainer,
								marginLeft: 4,
							}}
						>
							<Text style={styles.active}>Active Wallet</Text>
						</View>
					)}
				</View>
				<View style={styles.balanceContainer}>
					<Text style={styles.totalBalanceTitle}>Total Balance</Text>
					<Text style={styles.WalletBalance}>
						${finalSubWallets[selectedWallet].totalBalance}
					</Text>
				</View>
				{/* <TouchableOpacity
					style={styles.pressableContainer}
					onPress={() => {
						navigation.navigate('Edit Wallet Name');
					}}
				>
					<View
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<Image
							source={require('../assets/icons/Info.png')}
							style={styles.iconsLeft}
						/>
						<View>
							<View style={styles.cardTitleContainer}>
								<Text style={styles.cardTitle}>
									Wallet Name
								</Text>
							</View>
							<View style={styles.cardSubTitleContainer}>
								<Text style={styles.cardSubTitle}>
									{
										finalSubWallets[selectedWallet]
											.subWalletName
									}
								</Text>
							</View>
						</View>
					</View>
					<Image
						source={require('../assets/icons/Chevron_Left.png')}
						style={styles.iconRightArrow}
					/>
				</TouchableOpacity> */}
				<TouchableOpacity
					style={styles.pressableContainer}
					onPress={() => {
						copyToClipboard(finalSubWallets[selectedWallet].publicKey);
						onToggleSnackBar();
						
						//setLocalSelectedWallet(index);
						//setSelectedWallet(index);
					}}
				>
					<View style={styles.cardSubTitleContainer}>
						<Image
							source={require('../assets/icons/Keys.png')}
							style={styles.iconsLeft}
						/>
						<View>
							<View style={styles.cardTitleContainer}>
								<Text style={styles.cardTitle}>
									Wallet Address
								</Text>
							</View>
							<View style={styles.cardSubTitleContainer}>
								<Text style={styles.cardSubTitle}>
									{shortenPublicKey(
										finalSubWallets[selectedWallet]
											.publicKey,
										0,
										8,
										-8,
									)}
								</Text>
							</View>
						</View>
					</View>
					<Image
						source={require('../assets/icons/Copy.png')}
						style={styles.iconRightCopy}
					/>
				</TouchableOpacity>
				
			</View>
			<View style={{alignContent: 'flex-end'}}>
				<View style={{justifyContent: 'center', marginBottom: 8, marginHorizontal: -8, }} >
					<Snackbar 
						visible={snackIsVisible} 
						onDismiss={onDismissSnackBar}
						theme={{ colors: { accent: '#FFFFFF' }}}
						action={{
							label: '',
							onPress: async () => {
								setSnackIsVisible(false);
							},
							icon: () => (
								<Image
								source={require('../assets/icons/close_white.png')}
								style={{width: 14, height: 14, marginRight: 4, marginLeft: 85, marginVertical: 4}}
								/>
							)
						}}
						style={{borderRadius: 18, height: 56, alignSelf: 'stretch' , backgroundColor: '#1E2122', justifyContent: 'center'}}
					>
						<Text style={{color: '#FFFFFF', ...theme.fonts.Nunito_Sans.Caption_M_SemiBold}} >
							Address Copied!	
						</Text>
					</Snackbar>
				</View>
				<View>
					{selectedWallet === activeSubWallet ? (
						<View>
							{/* <View style={styles.setAsActiveButton}>
								<RedButton
									mode="outlined"
									onPress={async () =>
										bottomSheetModalRef.current?.present()
									}
								>
									Remove Wallet
								</RedButton>
							</View> */}
						</View>
					) : (
						<View >
							{/* <View style={styles.removeWalletButton}>
								<RedButton
									mode="outlined"
									onPress={async () =>
										bottomSheetModalRef.current?.present()
									}
								>
									Remove Wallet
								</RedButton>
							</View> */}
							<View style={styles.setAsActiveButton}>
								<ThemeButton
									mode="contained"
									onPress={async () => updateActiveWallet()}
								>
									Set as Active
								</ThemeButton>
							</View>
						</View>
					)}
				</View>
			</View>

			<BottomSheetModal
				handleStyle
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
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Text style={theme.fonts.Azeret_Mono.Header_M_SemiBold}>
							Remove Wallet?
						</Text>
						<TouchableOpacity
							onPress={() =>
								bottomSheetModalRef.current?.dismiss()
							}
						>
							<Image
								source={require('../assets/icons/Close.png')}
								style={styles.iconsLeft}
							/>
						</TouchableOpacity>
					</View>
					<Text
						style={{
							...theme.fonts.Nunito_Sans.Body_M_SemiBold,
							marginBottom: 24,
						}}
					>
						You can always re-import this wallet to Radiant in the
						future.
					</Text>
					<View style={styles.removeWalletButton}>
						<RedButton
							mode="contained"
							onPress={() =>
								bottomSheetModalRef.current?.dismiss()
							}
						>
							Yes, Remove Wallet
						</RedButton>
					</View>
					<View style={styles.setAsActiveButton}>
						<ThemeButton
							onPress={() =>
								bottomSheetModalRef.current?.dismiss()
							}
						>
							No, Keep Wallet
						</ThemeButton>
					</View>
				</View>
			</BottomSheetModal>
		</Background>
	);
};

const styles = StyleSheet.create({
	active: {
		...theme.fonts.Nunito_Sans.Caption_S_SemiBold,
	},
	activeContainer: {
		backgroundColor: theme.colors.success_three,
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	screenTitle: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	balanceContainer: {
		borderWidth: 1,
		borderColor: theme.colors.black_one,
		borderRadius: 18,
		marginBottom: 24,
		padding: 16,
	},
	totalBalanceTitle: {
		...theme.fonts.Azeret_Mono.Body_M_SemiBold,
		alignItems: 'center',
	},
	WalletBalance: {
		...theme.fonts.Nunito_Sans.Body_L_SemiBold,
		paddingVertical: 16,
	},
	pressableContainer: {
		borderColor: theme.colors.border,
		borderWidth: 1,
		borderRadius: 18,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 18,
		alignItems: 'center',
		marginBottom: 8,
	},
	cardTitleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	cardTitle: {
		...theme.fonts.Nunito_Sans.Body_M_Bold,
		color: theme.colors.black_one,
		justifyContent: 'flex-start',
	},
	iconsLeft: {
		width: 40,
		height: 40,
		marginRight: 16,
	},
	iconRightArrow: {
		width: 24,
		height: 24,
	},
	iconRightCopy: {
		width: 63,
		height: 30,
	},
	cardSubTitleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	cardSubTitle: {
		...theme.fonts.Nunito_Sans.Caption_M_SemiBold,
		color: theme.colors.black_five,
		marginLeft: 4,
	},
	removeWalletButton: {
		marginBottom: 16,
	},
	setAsActiveButton: {
		marginBottom: 24,
	},
});

export default memo(WalletDetailsScreen);
