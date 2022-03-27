import React, {
	memo,
	useState,
	useMemo,
	useRef,
	useCallback,
	useEffect,
} from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
	Background,
	ThemeButton,
	SubPageHeader,
	RedButton,
} from '../components';
import { Navigation } from '../types';
import { View, Image, ScrollView } from 'react-native';
//import Video from 'react-native-video';
import { Video, AVPlaybackStatus } from 'expo-av';
import { theme } from '../core/theme';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { shortenPublicKey, copyToClipboard } from '../utils';

import { useContext } from 'react';
import AppContext from '../components/AppContext';

type Props = {
	navigation: Navigation;
	route: Object;
};

const NFTdisplayScreen = ({ navigation, route }: Props) => {
	const nftIndex = route.params;
	const video = React.useRef(null);
	const subWalletNftsArray = useStoreState(
		(state) => state.subWalletNftsArray,
	);
	const [status, setStatus] = React.useState({});

	function getNft() {
		const result = subWalletNftsArray[nftIndex];
		console.log('result: ', result);
		return result;
	}

	function getCategory() {
		const category = subWalletNftsArray[nftIndex].Properties.category;
		if (category === 'video') {
			return (
				<Video
					ref={video}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
					}}
					source={{
						uri: subWalletNftsArray[nftIndex].Properties
							.animation_url,
					}}
					useNativeControls
					resizeMode="contain"
					isLooping
					onPlaybackStatusUpdate={(status) => setStatus(() => status)}
				/>
			);
		} else if (category === 'image') {
			return (
				<Image
					style={{
						flex: 1,
						height: undefined,
						width: undefined,
						resizeMode: 'contain',
					}}
					source={{
						uri: subWalletNftsArray[nftIndex].Preview_URL,
					}}
				/>
			);
		}
		// console.log('category: ', category);
	}

	useEffect(() => {
		getNft();
	}, []);

	return (
		<Background blackBackground={true} fullView={true}>
			<SubPageHeader
				backButton={true}
				whiteBackButton={true}
				fullScreen={true}
			></SubPageHeader>
			<View style={{ flex: 1 }}>{getCategory()}</View>
		</Background>
	);
};

export default memo(NFTdisplayScreen);
