import React, { memo, useState } from 'react';
import { Background, ThemeButton, TextInput, SubPageHeader } from '../components';
import { Navigation } from '../types';
import { View } from 'react-native';

type Props = {
	navigation: Navigation;
};

const GetStartedScreen = ({ navigation }: Props) => {
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');

	return (
		<Background position="bottom">
			<SubPageHeader backButton={false}>Import Wallet</SubPageHeader>
			<TextInput
				label="Wallet Name"
				mode="outlined"
				value={name}
				onChangeText={(text) => setName(text)}
				theme={{
					colors: { text: '#000' },
					fonts: {
						regular: {
							fontFamily: 'Inter_500Medium',
						},
					},
				}}
			/>
			<TextInput
				label="Secret"
				mode="outlined"
				multiline
				minHeight={150}
				value={secret}
				onChangeText={(text) => setSecret(text)}
				theme={{
					colors: { text: '#000' },
					fonts: {
						regular: {
							fontFamily: 'Inter_500Medium',
						},
					},
				}}
			/>

			<View style={{ height: 250 }}></View>
			<ThemeButton
				mode="contained"
				onPress={() => navigation.navigate('Dashboard')}
			>
				Import
			</ThemeButton>
		</Background>
	);
};

export default memo(GetStartedScreen);
