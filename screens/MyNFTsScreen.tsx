import React, { memo, useState, useEffect, useCallback, useRef, } from 'react';
import { Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Background, ThemeButton } from '../components';
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

import { useContext } from 'react';
import AppContext from '../components/AppContext';
import NFTcard from '../components/NFTcard';

type Props = {
	navigation: Navigation;
};

const myNFTsScreen = ({ navigation }: Props) => {
	const subWalletNftsArray = useStoreState((state) => state.subWalletNftsArray);

	return (
		<Background>
			<ScrollView showsVerticalScrollIndicator={false}>
				<SubPageHeader backButton={true}>My NFTs</SubPageHeader>
				{/* <View
					style={{
						borderWidth: 1,
						borderColor: theme.colors.border,
						backgroundColor: 'white',
						borderRadius: 18,
						padding: 16,
						height: 253,
					}}
				>
					<Text
						style={{
							marginVertical: 8,
							...theme.fonts.Azeret_Mono.Body_M_SemiBold,
						}}
					>
						My NFTs Value
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
							$1000.00
						</Text>
						
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

				<View style={{ marginTop: 24, marginBottom: 8}}>
					<Text
						style={{
							marginBottom: 8,
							...theme.fonts.Azeret_Mono.Body_M_SemiBold,
						}}
					>
						My NFTs
					</Text>

				</View>*/}
				<View>
					<FlatList
						numColumns = {2}
						data = {subWalletNftsArray}
						columnWrapperStyle={{justifyContent: 'space-between'}}
						renderItem = {(nft) => (
							<NFTcard
								nft = {nft} 
								fullCard={true}
								onPress={() =>
									navigation.navigate(
										'NFT Details',
										nft.index
									)
								}
							/>
						)}
						
					/>
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

export default memo(myNFTsScreen);
