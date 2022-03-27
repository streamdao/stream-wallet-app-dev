import React, { memo, useState, useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import {
	Background,
	ThemeButton,
	BackButton,
	Paragraph,
	TextInput,
	Header,
} from '../components';
import { Navigation } from '../types';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from '.';
import { AreaChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Shadow } from 'react-native-shadow-2';
import { Avatar, Card, IconButton } from 'react-native-paper';

type Props = {
	navigation: Navigation;
};

const TestScreen = ({ navigation }: Props) => {
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');

	async function test2() {
		const apiKey = 'f7353e06-2e44-4912-9fff-05929a5681a9';
		await fetch(
			`https://stream-wallet-server.streamdao.repl.co/api`,
			{
				method: 'POST',
				body: JSON.stringify({
					url: '/quotes/latest?symbol=sol',
				}),
				headers: { 'Content-type': 'application/json' },
			},
		)
			.then((response) => response.json())
			.then((res) => console.log('res', res))
			.catch((err) => console.log(err));
	}

	useEffect(() => {
		test2();
	}, []);

	return (
		// <SafeAreaView style={{margin: 16}}>

		<View style={[styles.container]}>
			<View style={{ flex: 2, backgroundColor: 'darkorange' }} />
			<View
				style={{
					flex: 1,
					backgroundColor: 'red',
					justifyContent: 'flex-end',
					alignItems: 'center',
				}}
			>
				<View style={{ flexDirection: 'row' }}>
					<View
						style={{
							backgroundColor: 'white',
							width: 100,
							height: 20,
							justifyContent: 'center',
							alignItems: 'center',
							margin: 8,
						}}
					>
						<Text>Hello</Text>
					</View>
					<View
						style={{
							backgroundColor: 'white',
							width: 100,
							height: 20,
							justifyContent: 'center',
							alignItems: 'center',
							margin: 8,
						}}
					>
						<Text>Hello</Text>
					</View>
				</View>
			</View>
			<View style={{ flex: 3, backgroundColor: 'green' }} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// padding: 20,
	},
});

export default memo(TestScreen);
