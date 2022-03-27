import React, { memo } from 'react';
import { Background, ThemeButton, SubPageHeader } from '../components';
import { Navigation } from '../types';
import { View, StyleSheet, Text, Image } from 'react-native';
import { theme } from '../core/theme';

type Props = {
	navigation: Navigation;
};

const OnboardingScreen = ({ navigation }: Props) => (
	<Background>
		<SubPageHeader backButton={false}>Add Money</SubPageHeader>
		{/* <View style={styles.container}> */}
		<View style={{ alignItems: 'center', marginTop: 24 }}>
			{/* <View style={{marginBottom: 16}}> */}
			<Image
				source={require('../assets/images/Add_Money_Graphic.jpg')}
				style={{
					width: 266,
					height: 234,
					alignSelf: 'center',
					marginBottom: 24,
				}}
			/>
			<Text style={theme.fonts.Nunito_Sans.Body_M_Regular}>
				Import a wallet you already use from the Solana ecosystem.
			</Text>
		</View>

		<View style={{ height: 450, marginTop: 48 }}>
			<View style={{ flexDirection: 'column' }}>
				{/* <View style={{ marginBottom: 16 }}>
					<ThemeButton
						mode="outlined"
						onPress={() => navigation.navigate('Create Wallet')}
					>
						Create Wallet
					</ThemeButton>
				</View> */}
				<ThemeButton
					mode="contained"
					onPress={() => navigation.navigate('Import Wallet')}
				>
					Import Wallet
				</ThemeButton>
			</View>
		</View>
	</Background>
);

const styles = StyleSheet.create({
	container: {
		// flex: 1
	},
});

export default memo(OnboardingScreen);
