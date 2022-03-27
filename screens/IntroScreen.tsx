import React, { memo, useEffect } from 'react';
import { Background, ThemeButton } from '../components';
import { Navigation } from '../types';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { theme } from '../core/theme';

type Props = {
	navigation: Navigation;
};

const IntroScreen = ({ navigation }: Props) => {
	async function test() {
		const test = await SecureStore.getItemAsync('test');
		console.log('test: ', test);
	}
	useEffect(() => {
		test();
	}, []);
	return (
		<Background blackBackground={true}>
			<View style={{ justifyContent: 'space-between' }}>
				<View style={{ alignItems: 'center', marginTop: 24 }}>
					{/* <View style={{marginBottom: 16}}> */}
					<Image
						source={require('../assets/images/logo2.png')}
						style={{
							width: 206,
							height: 212,
							alignSelf: 'center',
							marginBottom: 32,
						}}
					/>
					<Image
						source={require('../assets/images/radiant.png')}
						style={{
							width: 224,
							height: 33,
							alignSelf: 'center',
							marginBottom: 32,
						}}
					/>
					<Text
						style={{
							color: 'white',
							...theme.fonts.Nunito_Sans.Body_M_Regular,
						}}
					>
						Get access to the lowest token trade prices, widest
						selection, staking, NFT's and more.
					</Text>
				</View>

				<View style={{ height: 450, marginTop: 48 }}>
					<View
						style={{
							flexDirection: 'column',
							borderColor: '#668290',
							borderWidth: 1,
							borderRadius: 18,
							marginTop: 180,
						}}
					>
						<ThemeButton
							mode="contained"
							onPress={() => navigation.navigate('Set Passcode')}
							style={{ backgroundColor: 'black' }}
						>
							Get Started
						</ThemeButton>
					</View>
					<Text
						style={{
							...theme.fonts.Nunito_Sans.Caption_M_Regular,
							color: '#C3C3C3',
							alignSelf: 'center',
							marginTop: 32,
						}}
					>
						Copyright Radiant Wallet 2021
					</Text>
				</View>
			</View>
		</Background>
	);
};

const styles = StyleSheet.create({
	container: {
		// flex: 1
	},
});

export default memo(IntroScreen);
