import React, { memo, useState, useMemo, useRef, useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
	Background,
	ThemeButton,
	SubPageHeader,
	RedButton,
} from '../components';
import { Navigation } from '../types';
import { View, Image, ScrollView } from 'react-native';
import { theme } from '../core/theme';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { shortenPublicKey, copyToClipboard } from '../utils';
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import { TapGestureHandler } from 'react-native-gesture-handler';
import ReadMore from 'react-native-read-more-text';
import { Snackbar } from 'react-native-paper';

type Props = {
	navigation: Navigation;
	route: Object;
};

const NFTdetailsScreen = ({ navigation, route }: Props) => {
	const nftIndex = route.params; //simply passes FlatList index
	const subWalletNftsArray = useStoreState(
		(state) => state.subWalletNftsArray,
	);
	const [shortDescription, setShortDescription] = React.useState(true);
	const [snackIsVisible, setSnackIsVisible] = useState(false);

	const onToggleSnackBar = () => setSnackIsVisible(true);

	const onDismissSnackBar = () => setSnackIsVisible(false);

	function getAttributes() {
		const result = subWalletNftsArray[nftIndex].Properties.attributes.map(
			(item) => {
				return (
					<View>
						<View
							style={{
								backgroundColor: theme.colors.grey_two,
								borderRadius: 6,
								paddingHorizontal: 8,
								paddingVertical: 3,
								marginRight: 8,
								marginTop: 8,
							}}
						>
							<Text
								style={{
									...theme.fonts.Nunito_Sans
										.Caption_S_SemiBold,
									color: theme.colors.primary,
									flex: 1,
								}}
							>
								{item.trait_type}: {item.value}
							</Text>
						</View>
					</View>
				);
			},
		);
		return result;
	}

	const readMore = (handlePress) => {
		setShortDescription(false);
		return (
			<View>
				{/* <View style={{marginTop: 8}}></View> */}
				<View
					style={{
						marginTop: 8,
						//marginBottom: 24,
						flexDirection: 'row',
						flexWrap: 'wrap',
					}}
				>
					{getAttributes()}
				</View>
				<View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
					<Text
						style={{
							...theme.fonts.Nunito_Sans.Body_M_Bold,
							color: theme.colors.black_four,
							marginBottom: 0,
							padding: 0,
						}}
						onPress={handlePress}
					>
						Read more
					</Text>
				</View>
			</View>
		);
	};

	const readLess = (handlePress) => {
		return (
			<View>
				{/* <View style={{marginTop: 8}}></View> */}
				<View
					style={{
						marginTop: 8,
						//marginBottom: 24,
						flexDirection: 'row',
						flexWrap: 'wrap',
					}}
				>
					{getAttributes()}
				</View>
				<View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
					<Text
						style={{
							...theme.fonts.Nunito_Sans.Body_M_Bold,
							color: theme.colors.black_four,
							marginBottom: 0,
							padding: 0,
						}}
						onPress={handlePress}
					>
						Read less
					</Text>
				</View>
			</View>
		);
	};

	function formatDescription() {
		const result = subWalletNftsArray[nftIndex].Description;
		return result.replace(/\s+/g, ' ').trim();
	}

	function getCreators() {
		const result = subWalletNftsArray[nftIndex].Creators.map((item) => {
			return (
				<TouchableOpacity
					style={{ marginVertical: 2 }}
					onPress={() => {
						copyToClipboard(item.address);
						onToggleSnackBar();
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'flex-end',
							marginVertical: 16,
						}}
					>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Body_M_SemiBold,
								color: theme.colors.primary,
							}}
						>
							{shortenPublicKey(item.address, 0, 4, -4)}
						</Text>
						<Image
							source={require('../assets/icons/Copy_3.png')}
							style={{ width: 32, height: 30, marginLeft: 8 }}
						/>
					</View>
				</TouchableOpacity>
			);
		});
		return result;
	}

	return (
		<Background>
			<ScrollView showsVerticalScrollIndicator={false}>
				<SubPageHeader backButton={true}>NFT Details</SubPageHeader>
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						backgroundColor: 'white',
						borderRadius: 18,
						padding: 16,
					}}
				>
					<View style={{ borderRadius: 8, height: 297 }}>
						<TouchableOpacity
							style={{ flex: 1 }}
							onPress={() =>
								navigation.navigate('NFT Display', nftIndex)
							}
						>
							<Image
								source={{
									uri: subWalletNftsArray[nftIndex]
										.Preview_URL,
								}}
								style={{
									flex: 1,
									height: undefined,
									width: undefined,
									resizeMode: 'cover',
									borderRadius: 8,
									marginBottom: 24,
									overlayColor: 'white',
								}}
							/>
						</TouchableOpacity>
					</View>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						<View>
							<Text
								style={{
									...theme.fonts.Azeret_Mono.Body_M_SemiBold,
									marginBottom: 0,
								}}
								numberOfLines={1}
							>
								{subWalletNftsArray[nftIndex].Title}
							</Text>
							<Text
								style={{
									...theme.fonts.Nunito_Sans
										.Caption_M_SemiBold,
									color: theme.colors.grey_seven,
									marginTop: 2,
								}}
							></Text>
							{/* <Text style={{...theme.fonts.Nunito_Sans.Caption_M_SemiBold, color: theme.colors.grey_seven, marginTop: 2}}>
                                Creator Name
                            </Text> */}
						</View>
						<View style={{ alignItems: 'flex-end' }}>
							{/* <Text style={{...theme.fonts.Nunito_Sans.Caption_M_Bold}}>
                                $1050.06
                            </Text>
                            <Text style={{...theme.fonts.Nunito_Sans.Caption_M_SemiBold, marginTop: 2, marginBottom: 24}}>
                                45%
                            </Text> */}
						</View>
					</View>
					<View style={{}}>
						<ReadMore
							numberOfLines={3}
							renderTruncatedFooter={readMore}
							renderRevealedFooter={readLess}
						>
							<Text
								style={{
									...theme.fonts.Nunito_Sans.Body_M_Regular,
									color: theme.colors.grey_eight,
									includeFontPadding: false,
								}}
							>
								{formatDescription()}
							</Text>
						</ReadMore>
						{subWalletNftsArray[nftIndex].Properties.attributes
							?.length && shortDescription ? (
							<View
								style={{
									marginTop: 8,
									flexDirection: 'row',
									flexWrap: 'wrap',
								}}
							>
								{getAttributes()}
							</View>
						) : null}
					</View>
				</View>
				<View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						backgroundColor: 'white',
						borderRadius: 18,
						padding: 16,
						marginTop: 16,
					}}
				>
					<Text
						style={{ ...theme.fonts.Azeret_Mono.Body_M_SemiBold }}
					>
						Chain Info
					</Text>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: 16,
							paddingVertical: 21,
						}}
					>
						<Text
							style={{
								...theme.fonts.Nunito_Sans.Caption_M_SemiBold,
								color: theme.colors.black_five,
							}}
						>
							Mint
						</Text>
						<TouchableOpacity
							onPress={() => {
								copyToClipboard(
									subWalletNftsArray[nftIndex].Mint,
								);
								onToggleSnackBar();
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<Text
									style={{
										...theme.fonts.Nunito_Sans
											.Body_M_SemiBold,
										color: theme.colors.primary,
									}}
								>
									{shortenPublicKey(
										subWalletNftsArray[nftIndex].Mint,
										0,
										4,
										-4,
									)}
								</Text>
								<Image
									source={require('../assets/icons/Copy_3.png')}
									style={{
										width: 32,
										height: 30,
										marginLeft: 8,
									}}
								/>
							</View>
						</TouchableOpacity>
					</View>
					<View
						style={{
							borderTopWidth: 1,
							borderTopColor: theme.colors.grey_four,
							marginBottom: 2,
							marginTop: 4,
						}}
					></View>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						{subWalletNftsArray[nftIndex].Creators.length > 1 ? (
							<Text
								style={{
									...theme.fonts.Nunito_Sans
										.Caption_M_SemiBold,
									color: theme.colors.black_five,
									alignItems: 'flex-start',
									marginTop: 23,
								}}
							>
								Creators
							</Text>
						) : (
							<Text
								style={{
									...theme.fonts.Nunito_Sans
										.Caption_M_SemiBold,
									color: theme.colors.black_five,
									alignItems: 'flex-start',
									marginTop: 23,
								}}
							>
								Creator
							</Text>
						)}
						<View style={{ flexDirection: 'column' }}>
							{getCreators()}
						</View>
					</View>
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
};

export default memo(NFTdetailsScreen);
