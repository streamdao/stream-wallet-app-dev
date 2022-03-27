import React, { memo, useState, useEffect } from 'react';
import { Text, TouchableOpacity, TextInput as TextInputRN } from 'react-native';
import { Background, TextInput } from '../components';
import { Navigation } from '../types';
import { View, FlatList, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { SubPageHeader } from '../components';
import { theme } from '../core/theme';
import TokenCard from '../components/TokenCard';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';

import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import Colors from '../constants/Colors';

type Props = {
	navigation: Navigation;
	route: Object;
};

const SearchTokensScreen = ({ navigation, route }: Props) => {
	console.log('route.params', route.params);
	const pair = route.params.pair;
	const setPair = route.params.setPair;
	const [search, setSearch] = useState('');
	const allTokens = useStoreState((state) => state.allTokens);
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const firstLoadedTokens = useStoreState((state) => state.firstLoadedTokens);
	const activeSubWallet = useStoreState((state) => state.activeSubWallet);

	const [filteredTokens, setFilteredTokens] = useState(ownedTokens);

	const searchFilter = () => {
		if (activeSubWallet === 0) {
			return firstLoadedTokens.filter((token) => {
				return (
					token.symbol.toLowerCase().includes(search.toLowerCase()) ||
					token.name.toLowerCase().includes(search.toLowerCase())
				);
			});
		}
		return ownedTokens[activeSubWallet].filter((token) => {
			return (
				token.symbol.toLowerCase().includes(search.toLowerCase()) ||
				token.name.toLowerCase().includes(search.toLowerCase())
			);
		});
	};

	async function getDefaultPairToken() {
		const hasUSDC = pair.to.pairs.find(
			(pair: object) => pair.symbol === 'USDC',
		);
		if (hasUSDC) {
			const usdcToken = allTokens.find(
				(token: object) => token.symbol === 'USDC',
			);
			return usdcToken;
		} else {
			const symbol1 = pair.to.pairs[0].symbol;
			const symbol2 = pair.to.pairs[1].symbol;
			const otherToken = allTokens.find(
				(token: object) => token.symbol === symbol1,
			);
			const otherToken2 = allTokens.find(
				(token: object) => token.symbol === symbol2,
			);
			if (otherToken) {
				return otherToken;
			} else {
				return otherToken2;
			}
		}
	}

	useEffect(() => {
		setFilteredTokens(searchFilter());
	}, [search]);

	return (
		<Background dismissKeyboard={true}>
			<View style={{ marginBottom: 24 }}>
				<SubPageHeader backButton={true}>
					Select From Token
				</SubPageHeader>

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
						source={require('../assets/icons/Search.png')}
						style={{ width: 24, height: 24, marginRight: 8 }}
					/>

					<TextInputRN
						style={{
							borderColor: 'black',
							borderWidth: 0,
							...theme.fonts.Nunito_Sans.Body_M_Regular,
						}}
						onChangeText={(text: string) => setSearch(text)}
						value={search}
						placeholder="Search token name or symbol"
						keyboardType="default"
					/>
				</View>
			</View>

			{filteredTokens ? (
				<FlatList
					data={filteredTokens}
					renderItem={(token) => (
						<TokenCard
							token={token}
							onPress={() => {
								if (
									pair.to.pairs.find(
										(el) => el.symbol === token.item.symbol,
									)
								) {
									setPair({
										...pair,
										from: token.item,
									});
									return navigation.navigate('Trade', {
										from: token.item,
										to: pair.to,
									});
								} else {
									setPair({
										...pair,
										from: token.item,
										to: getDefaultPairToken(),
									});
									return navigation.navigate('Trade', {
										from: token.item,
										to: pair.to,
									});
								}
							}}
						/>
					)}
					keyExtractor={(item) => item.address}
				/>
			) : null}
		</Background>
	);
};

export default memo(SearchTokensScreen);
