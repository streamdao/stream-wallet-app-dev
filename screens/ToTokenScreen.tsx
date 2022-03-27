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
};

const SearchTokensScreen = ({ navigation, route }: Props) => {
	const [search, setSearch] = useState('');
	const allTokens = useStoreState((state) => state.allTokens);
	const ownedTokens = useStoreState((state) => state.ownedTokens);
	const [filteredTokens, setFilteredTokens] = useState(allTokens);

	const searchFilter = (allTokens: Array<object>) => {
		return allTokens.filter((token) => {
			return (
				token.symbol.toLowerCase().includes(search.toLowerCase()) ||
				token.name.toLowerCase().includes(search.toLowerCase())
			);
		});
	};

	useEffect(() => {
		setFilteredTokens(searchFilter(allTokens));
	}, [search]);

	return (
		<Background dismissKeyboard={true}>
			<View style={{ marginBottom: 24 }}>
				<SubPageHeader backButton={true}>Select To Token</SubPageHeader>

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
								route.params.setPair({
									...route.params.pair,
									to: token.item,
								});
								return navigation.navigate('Trade', {
									from: route.params.pair.from,
									to: token.item,
								});
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
