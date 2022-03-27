import React, { memo, useState } from 'react';
import { StyleSheet, Text, View, TextInput as TextInputRN } from 'react-native';
import TextInput from '../components/TextInput'
import { Background, SubPageHeader } from '../components';
import { Navigation } from '../types';
import { theme } from '../core/theme';
import { useStoreState } from '../hooks/storeHooks';

type Props = {
	navigation: Navigation;
};

const EditWalletNameScreen = () => {

	const [name, setName] = useState('');
	const selectedWallet = useStoreState((state) => state.selectedWallet);
	const subWallets = useStoreState((state) => state.subWallets);

	const walletNameHandler = inputText => {
		setName(inputText);
	}

	const confirmInputHandler = () => {
		
	}
	return (
		<Background dismissKeyboard={false}>
			<View style={{ marginBottom: 24 }}>
				<SubPageHeader backButton>Edit Name</SubPageHeader>

				<View style={styles.textBoxContainer}>    
					<TextInputRN
						style={styles.textBox}
						placeholder={subWallets[selectedWallet].subWalletName}
						keyboardType="default"
						value={name}
						onChangeText={walletNameHandler}
					/>
				</View>
			</View>
			<Text>{name}</Text>
		</Background>
	);
};

const styles = StyleSheet.create({
	textBoxContainer: {
		height: 64,
		borderWidth: 1,
		borderColor: theme.colors.black_seven,
		borderRadius: 18,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	textBox: {
		borderWidth: 0,
		width: '100%',
		...theme.fonts.Nunito_Sans.Body_M_Regular,	
	}
	
});

export default memo(EditWalletNameScreen);
