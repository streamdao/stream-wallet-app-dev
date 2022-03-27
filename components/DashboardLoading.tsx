import React, { memo, useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View, FlatList, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { theme } from '../core/theme';
import { normalizeNumber } from '../utils';
// const addCommas = new Intl.NumberFormat('en-US');

const DashboardLoading = () => {
	return (
		<>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
			<View
				style={{
					borderColor: theme.colors.border,
					borderWidth: 1,
					borderRadius: 18,
					padding: 16,
					marginBottom: 8,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={{
							borderRadius: 1000,
							backgroundColor: theme.colors.black_seven,
							height: 40,
							width: 40,
							marginRight: 16,
						}}
					/>
					<View>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 131,
								backgroundColor: theme.colors.black_seven,
								marginBottom: 8,
							}}
						/>
						<View
							style={{
								borderRadius: 4,
								height: 14,
								width: 93,
								backgroundColor: theme.colors.black_seven,
							}}
						/>
					</View>
				</View>
			</View>
		</>
	);
};

export default DashboardLoading;
