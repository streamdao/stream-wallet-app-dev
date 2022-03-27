const { getDefaultConfig } = require('@expo/metro-config');

const nodeLibs = require('node-libs-expo');

module.exports = async () => {
	const {
		resolver: { sourceExts, assetExts },
	} = await getDefaultConfig(__dirname);

	return {
		resolver: {
			sourceExts: [...sourceExts, 'svg', 'jsx', 'js', 'ts', 'tsx', 'cjs'],
			extraNodeModules: {
				...nodeLibs,
				stream: require.resolve('readable-stream'),
			},
			assetExts: [...assetExts.filter((ext) => ext !== 'svg')],
			assetPlugins: ['expo-asset/tools/hashAssetFiles'],
		},
		transformer: {
			babelTransformerPath: require.resolve(
				'react-native-svg-transformer',
			),
		},
	};
};

// {
// 	resolver: {
// 		sourceExts: [
// 			...defaultConfig.resolver.sourceExts,
// 			'svg',
// 			'jsx',
// 			'js',
// 			'ts',
// 			'tsx',
// 			'cjs',
// 		],
// 		// extraNodeModules: {
// 		//   stream: require.resolve("readable-stream"),
// 		// },
// 		extraNodeModules: require('node-libs-expo'),
// 		assetExts: [
// 			...defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
// 		],
// 		transformer: {
// 			babelTransformerPath: require.resolve(
// 				'react-native-svg-transformer',
// 			),
// 		},
// 	},
// };
