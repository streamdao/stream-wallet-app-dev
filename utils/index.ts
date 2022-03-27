/* eslint-disable no-case-declarations */
import * as solanaWeb3 from '@solana/web3.js';
import * as Random from 'expo-random';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import * as ed25519 from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Account, Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { derivePath } from 'ed25519-hd-key';
import * as bip32 from 'bip32';
import { Alert } from 'react-native';
import {
	fullSymbolsList,
	symbolList1,
	symbolList2,
	symbolList3,
} from '../tokensList';
import * as Clipboard from 'expo-clipboard'; // <-- might have to change to '@react-native-community/clipboard' when not using expo but '@react-native-community/clipboard' will not work on Android with expo.
import * as SecureStore from 'expo-secure-store';
import { useStoreState, useStoreActions } from '../hooks/storeHooks';
import SnackBar from 'react-native-snackbar';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
	'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
// const url =
// 	'https://solana--mainnet.datahub.figment.io/apikey/5d2d7ea54a347197ccc56fd24ecc2ac5';
const url =
	'https://proud-small-pond.solana-mainnet.quiknode.pro/b9308b243fd5cda46faf633bfc52df5a1b2d7abf/';
const connection = new Connection(url);
const programId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
// const apiKey = 'f7353e06-2e44-4912-9fff-05929a5681a7';
const apiKey = 'fb778058-7d11-4c17-8f03-5212f68ed1c7';

async function findAssociatedTokenAddress(
	walletAddress: PublicKey,
	tokenMintAddress: PublicKey,
): Promise<PublicKey> {
	//console.log('here');
	return (
		await PublicKey.findProgramAddress(
			[
				walletAddress.toBuffer(),
				TOKEN_PROGRAM_ID.toBuffer(),
				tokenMintAddress.toBuffer(),
			],
			SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
		)
	)[0];
}

function shortenPublicKey(
	publicKey: string,
	keepStart: number,
	keepEnd: number,
	sliceEnd: number,
) {
	return (
		publicKey.slice(keepStart, keepEnd) + '...' + publicKey.slice(sliceEnd)
	);
}

function normalizeNumber(number: number) {
	return parseFloat(number)
		?.toFixed(2)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const DERIVATION_PATH = {
	deprecated: undefined,
	bip44: 'bip44',
	bip44Change: 'bip44Change',
	bip44Root: 'bip44Root', // Ledger only.
};

function getAccountFromSeed(
	seed,
	walletIndex,
	dPath = undefined,
	accountIndex = 0,
) {
	const derivedSeed = deriveSeed(seed, walletIndex, dPath, accountIndex);
	return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
}

const deriveSeed = (
	seed: string,
	walletIndex: number,
	derivationPath: string,
	accountIndex: number,
): Buffer | undefined => {
	const path44Change = `m/44'/501'/${walletIndex}'/0'`;
	return ed25519.derivePath(path44Change, Buffer.from(seed, 'hex')).key;
};

const deriveSeed2 = (
	seed: string,
	walletIndex: number,
	derivationPath: string,
	accountIndex: number,
): Buffer | undefined => {
	const path44Change = `m/44'/501'/${walletIndex}'/0'`;
	return ed25519.derivePath(path44Change, Buffer.from(seed, 'hex')).key;
};

// export const DERIVATION_PATH = {
// 	bip44Change: 'bip44Change',
// };

const copyToClipboard = async (copied: string) => {
	Clipboard.setString(copied);
	// Alert.alert('Address Copied!', copied, [
	// 	{ text: 'Okay', style: 'destructive' },
	// ]);
};

const generateMnemonic = async () => {
	const randomBytes = await Random.getRandomBytesAsync(32);
	const mnemonic = ethers.utils.entropyToMnemonic(randomBytes);
	return mnemonic;
};

const mnemonicToSeed = async (mnemonic: string) => {
	const bip39 = await import('bip39');
	const seed = await bip39.mnemonicToSeed(mnemonic);
	return Buffer.from(seed).toString('hex');
};

const accountFromSeed = (
	seed: string,
	walletIndex: number,
	derivationPath: string,
	accountIndex: 0,
) => {
	const derivedSeed = deriveSeed(
		seed,
		walletIndex,
		derivationPath,
		accountIndex,
	);
	const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

	const acc = new solanaWeb3.Keypair(keyPair);
	return acc;
};

const maskedAddress = (address: string) => {
	if (!address) return;
	return `${address.slice(0, 8)}...${address.slice(address.length - 8)}`;
};

async function getSubWalletsData(passcode: string) {
	const subWallets1 = [];
	let iterate = true;
	let i = 0;

	while (iterate === true) {
		const newAccount = await getSolanaAccount(i, passcode);

		const { publicKey } = newAccount;
		const subWalletName = 'SubWallet ' + (1 + i); //this needs to get the name from user input or a default name
		const programId = new PublicKey(
			'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
		);
		const ownedTokens = await connection
			.getTokenAccountsByOwner(publicKey, { programId })
			.catch((err) => console.warn('errorr', err));
		const result2 = await connection.getParsedAccountInfo(publicKey);

		if (!result2.value) {
			iterate = false;
		} else {
			subWallets1.push({
				publicKey: publicKey.toString('hex'),
				subWalletName: subWalletName,
			});
		}
		i++;
	}
	return subWallets1;
}

//gets owned tokens, adds sol to it, adds detail to all the coins, then sets to state
async function getOwnedTokensData(
	subWallets: any,
	passcode: string,
	tokenMap: any,
	tokenPairs: any,
) {
	console.log('hello get owned');
	// const tokenPairs = await getTokenPairs();
	const solPairs = tokenPairs.find((pair: object) => (pair.symbol = 'SOL'));

	const tokensBySubWallet = [];
	const newAccountArray = [];
	for (let i = 0; i < subWallets.length; i++) {
		const newAccount = await getSolanaAccount(i, passcode);

		const { publicKey } = newAccount;

		const ownedTokens = await connection
			.getTokenAccountsByOwner(publicKey, { programId })
			.catch((err) => console.log('errorr', err));

		const solBalance = await connection.getBalance(publicKey);
		const realSolBalance = solBalance * 0.000000001;

		const ownedTokensArray = [];
		let solToken;
		if (solBalance > 0) {
			const priceData = await fetch(
				`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SOL`,
				{
					headers: {
						'X-CMC_PRO_API_KEY': apiKey,
						Accept: 'application/json',
						'Accept-Encoding': 'deflate, gzip',
					},
				},
			)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					const dataArray = Object.values(data.data);
					const percent_change_24h =
						dataArray[0].quote.USD.percent_change_24h;
					const percent_change_30d =
						dataArray[0].quote.USD.percent_change_30d;
					const percent_change_60d =
						dataArray[0].quote.USD.percent_change_60d;
					const percent_change_90d =
						dataArray[0].quote.USD.percent_change_90d;
					const {
						price,
						volume_24h,
						market_cap,
						market_cap_dominance,
					} = dataArray[0].quote.USD;
					return {
						price,
						percent_change_24h,
						percent_change_30d,
						percent_change_60d,
						percent_change_90d,
						volume_24h,
						market_cap,
						market_cap_dominance,
					};
				})
				.catch((error) => console.warn('hello error', error));

			const {
				price,
				percent_change_24h,
				percent_change_30d,
				percent_change_60d,
				percent_change_90d,
				volume_24h,
				market_cap,
				market_cap_dominance,
			} = priceData;
			const price_30d = price * (1 + percent_change_30d * 0.01);
			const price_60d = price * (1 + percent_change_60d * 0.01);
			const price_90d = price * (1 + percent_change_90d * 0.01);
			const tokenObject = {
				mint: 'So11111111111111111111111111111111111111112',
				amount: realSolBalance,
				name: 'Solana',
				symbol: 'SOL',
				logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
				extensions: {
					discord: 'https://discord.com/invite/pquxPsq',
					twitter: 'https://twitter.com/solana',
					website: 'https://solana.com/',
				},
				price,
				price_30d,
				price_60d,
				price_90d,
				pairs: solPairs.pairs,
				percent_change_24h,
				percent_change_30d,
				percent_change_60d,
				percent_change_90d,
				volume_24h,
				market_cap,
				description:
					'Solana (SOL) is a cryptocurrency launched in 2020. Solana has a current supply of 506,348,680.4303728 with 299,902,995.15039116 in circulation. The last known price of Solana is 146.68289748 USD and is up 1.09 over the last 24 hours. It is currently trading on 161 active market(s) with $2,959,138,044.47 traded over the last 24 hours. More information can be found at https://solana.com.',
				market_cap_dominance,
			};
			ownedTokensArray.push(tokenObject);
			solToken = tokenObject;
		}
		const ownedTokensSymbols = [];
		for (let i = 0; i < ownedTokens.value.length; i++) {
			const result = await connection.getParsedAccountInfo(
				ownedTokens.value[i].pubkey,
			);

			const mint = result.value.data.parsed.info.mint;
			const amount = result.value.data.parsed.info.tokenAmount.uiAmount;
			const otherDetails = await tokenMap.get(mint);
			if (otherDetails) {
				let pairs = tokenPairs.find(
					(pair: object) => pair.symbol === otherDetails.symbol,
				);

				if (!pairs) {
					pairs = { pairs: false };
				}

				const mintKey = new PublicKey(mint);

				const associatedTokenAddress = await findAssociatedTokenAddress(
					publicKey,
					mintKey,
				);

				const associatedTokenAddressHash =
					associatedTokenAddress.toString('hex');
				const tokenObject = {
					mint,
					amount,
					name: otherDetails.name,
					symbol: otherDetails.symbol,
					logo: otherDetails.logoURI,
					extensions: otherDetails.extensions,
					pairs: pairs.pairs,
					associatedTokenAddressHash,
					associatedTokenAddress,
				};
				ownedTokensArray.push(tokenObject);
				ownedTokensSymbols.push(otherDetails.symbol);
			}
		}

		const filteredOwnedSymbols = ownedTokensSymbols.filter((symbol) => {
			const filter = /\d+/;
			const filteredSymbol = symbol.match(filter);
			return filteredSymbol ? false : true;
		});
		let ownedSymbolsList = filteredOwnedSymbols.join();
		console.log('ownedSymbolsList: ', ownedSymbolsList);

		let iterate = true;
		let counter = 0;
		const aboutData: Array<object> = [];

		while (counter < 10 && iterate) {
			console.log('get owned while route for about data' + ' ' + iterate);
			await fetch(
				`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${ownedSymbolsList}`,
				{
					headers: {
						'X-CMC_PRO_API_KEY': apiKey,
						Accept: 'application/json',
						'Accept-Encoding': 'deflate, gzip',
					},
				},
			)
				.then((response) => {
					return response.json();
				})
				.then((res) => {
					console.log('res', res);
					if (res.status.error_code !== 0) {
						if (res.status.error_message.includes('symbol')) {
							//remove the symbol causing the error
							const problemSymbol = res.status.error_message
								.split('\\')[0]
								.replace('Invalid value for ', '')
								.replace(/['"]+/g, '')
								.replace(' ', '')
								.replace('symbol', '')
								.replace(':', '')
								.replace('"', '')
								.toUpperCase();
							const index =
								ownedSymbolsList.indexOf(problemSymbol);
							const length = problemSymbol.length + 1;
							const newArray =
								ownedSymbolsList.substr(0, index) +
								ownedSymbolsList.substr(
									index + length,
									ownedSymbolsList.length - 1,
								);
							ownedSymbolsList = newArray;
							console.log(
								'ownedSymbolsList Fixed: ',
								ownedSymbolsList,
							);
						}
						counter++;
					} else {
						iterate = false;
						return aboutData.push(...Object.values(res.data));
					}
				})
				.catch((err) => console.log('errerere', err));
		}

		console.log('aboutData in get owned', aboutData);

		const combinedOwnedTokensArray = [];
		for (let i = 0; i < ownedTokensArray.length; i++) {
			const tokenObject = ownedTokensArray[i];
			const cmcToken = aboutData.find(
				(token: object) => token.symbol === tokenObject.symbol,
			);
			const newTokenObject = {
				description: cmcToken?.description
					? cmcToken.description
					: 'No description available',
				...tokenObject,
			};
			combinedOwnedTokensArray.push(newTokenObject);
		}
		console.log('price get owned symbolslist', ownedSymbolsList);
		const priceData = await fetch(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${ownedSymbolsList}`,
			{
				headers: {
					'X-CMC_PRO_API_KEY': apiKey,
					Accept: 'application/json',
					'Accept-Encoding': 'deflate, gzip',
				},
			},
		)
			.then((response) => {
				return response.json();
			})
			.then((res) => {
				if (res.status.error_code !== 0) {
					return {
						description:
							'No description available for this project.',
						logo: 'https://radiantwallet.s3.us-east-2.amazonaws.com/Random_Token.png',
						name: 'unkown',
						extensions: {},
					};
				} else {
					return Object.values(res.data);
				}
			})
			.catch((err) => console.log('errerere', err));

		console.log('price get owned priceData', priceData);
		const finalCombinedOwnedTokensArray = [];

		for (let i = 1; i < combinedOwnedTokensArray.length; i++) {
			const tokenObject = combinedOwnedTokensArray[i];
			console.log('tokenObject get owned: ', tokenObject);
			const cmcToken = priceData.find(
				(token: object) => token.symbol === tokenObject.symbol,
			);
			console.log('cmcToken get owned: ', cmcToken);
			if (cmcToken && cmcToken.quote) {
				const {
					price,
					percent_change_24h,
					percent_change_30d,
					percent_change_60d,
					percent_change_90d,
					volume_24h,
					market_cap,
					market_cap_dominance,
				} = cmcToken.quote.USD;
				const newTokenObject = {
					price,
					percent_change_24h,
					percent_change_30d,
					percent_change_60d,
					percent_change_90d,
					volume_24h,
					market_cap,
					market_cap_dominance,
					price_30d: price * (1 + percent_change_30d * 0.01),
					price_60d: price * (1 + percent_change_60d * 0.01),
					price_90d: price * (1 + percent_change_90d * 0.01),
					...tokenObject,
				};
				finalCombinedOwnedTokensArray.push(newTokenObject);
			} else {
				const newTokenObject = {
					price: 0,
					percent_change_24h: 0,
					percent_change_30d: 0,
					percent_change_60d: 0,
					percent_change_90d: 0,
					volume_24h: 0,
					market_cap: 0,
					market_cap_dominance: 0,
					price_30d: price * (1 + percent_change_30d * 0.01),
					price_60d: price * (1 + percent_change_60d * 0.01),
					price_90d: price * (1 + percent_change_90d * 0.01),
					...tokenObject,
				};
				finalCombinedOwnedTokensArray.push(newTokenObject);
			}
		}
		if (solToken) {
			finalCombinedOwnedTokensArray.push(solToken);
		}

		console.log(
			'finalCombinedOwnedTokensArray get owned',
			finalCombinedOwnedTokensArray,
		);

		tokensBySubWallet.push(finalCombinedOwnedTokensArray);
		newAccountArray.push(newAccount);
	}
	return {
		tokensBySubWallet: tokensBySubWallet,
		newAccount: newAccountArray,
	};
}

async function getSolanaAccount(activeSubWallet: number, passcode: string) {
	let mnemonic = await SecureStore.getItemAsync(passcode);
	const bip39 = await import('bip39');
	const seed = await bip39.mnemonicToSeed(mnemonic); //returns 64 byte array

	const newAccount = accountFromSeed(
		seed,
		activeSubWallet,
		DERIVATION_PATH.bip44Change,
		0,
	);

	return newAccount;
}

async function getOwnedNftsData(activeSubWalletAddress: string) {
	const ownedNfts = await fetch(
		`https://api.all.art/v1/wallet/${activeSubWalletAddress}`,
	)
		.then((response) => response.json())
		.then((data) => {
			return data;
		})
		.catch((eerror) => console.log('helllllo error', eerror));

	const nftArray = [];
	const { Pubkey, __v, _id, createdAt, listedNfts, unlistedNfts } = ownedNfts;

	for (let i = 0; i < unlistedNfts.length; i++) {
		const nft = unlistedNfts[i];

		const {
			Creators,
			Description,
			Items,
			LicenseTitle,
			License_URL,
			Mint,
			Preview_URL,
			Properties,
			PubKey,
			Standard,
			Title,
			__v,
			_id,
			adminReported,
			collectionKey,
			createdAt,
			isNFTPRO,
			jsonURL,
			liked,
			listed,
			nft_colletion,
			nsfw,
			reported,
			tags,
			updatedAt,
			verfied,
		} = nft;

		const newObject = {
			Creators,
			Description,
			Items,
			LicenseTitle,
			License_URL,
			Mint,
			Preview_URL,
			Properties,
			PubKey,
			Standard,
			Title,
			__v,
			_id,
			adminReported,
			collectionKey,
			createdAt,
			isNFTPRO,
			jsonURL,
			liked,
			listed,
			nft_colletion,
			nsfw,
			reported,
			tags,
			updatedAt,
			verfied,
		};

		nftArray.push(newObject);
	}
	return nftArray;

	// for (let [key, value] of Object.entries(ownedNFTs)) {
	// 	console.log(`${key}: ${value}`);
	// }
	// for (const name of Object.getOwnPropertyNames(ownedNFTs)) {
	// 	const value = ownedNFTs[name];
	// 	console.log(`${String(name)}: ${value}`);
	// }

	// for (let i = 0; i < ownedNFTs.length; i++) {

	// 	const nft = ownedNFTs[i];

	// 	const {
	// 		Title,
	// 		id,
	// 	} = nft;
	// 	const newObject = {
	// 		Title,
	// 		id,
	// 	};
	// 	nftArray.push(newObject);
	// }
	//console.log('NFT test: ', nftArray)
}

async function getActiveSubWalletTokens(
	activeSubWallet: number,
	passcode: string,
	tokenMap: any,
	tokenPairs: any,
) {
	const newAccount = await getSolanaAccount(activeSubWallet, passcode);
	// const tokenPairs = await getTokenPairs();
	const solPairs = tokenPairs.find((pair: object) => (pair.symbol = 'SOL'));

	const { publicKey } = newAccount;

	const ownedTokens = await connection
		.getTokenAccountsByOwner(publicKey, { programId })
		.catch((err) => console.log('errorr', err));

	const solBalance = await connection.getBalance(publicKey);
	const realSolBalance = solBalance * 0.000000001;
	console.log('realSolBalance: ', realSolBalance);

	const ownedTokensArray = [];
	let solToken;
	if (solBalance > 0) {
		const priceData = await fetch(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SOL`,
			{
				headers: {
					'X-CMC_PRO_API_KEY': apiKey,
					Accept: 'application/json',
					'Accept-Encoding': 'deflate, gzip',
				},
			},
		)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				const dataArray = Object.values(data.data);
				const percent_change_24h =
					dataArray[0].quote.USD.percent_change_24h;
				const percent_change_30d =
					dataArray[0].quote.USD.percent_change_30d;
				const percent_change_60d =
					dataArray[0].quote.USD.percent_change_60d;
				const percent_change_90d =
					dataArray[0].quote.USD.percent_change_90d;
				const { price, volume_24h, market_cap, market_cap_dominance } =
					dataArray[0].quote.USD;
				return {
					price,
					percent_change_24h,
					percent_change_30d,
					percent_change_60d,
					percent_change_90d,
					volume_24h,
					market_cap,
					market_cap_dominance,
				};
			})
			.catch((error) => console.log('hello error', error));

		const {
			price,
			percent_change_24h,
			percent_change_30d,
			percent_change_60d,
			percent_change_90d,
			volume_24h,
			market_cap,
			market_cap_dominance,
		} = priceData;
		const price_30d = price * (1 + percent_change_30d * 0.01);
		const price_60d = price * (1 + percent_change_60d * 0.01);
		const price_90d = price * (1 + percent_change_90d * 0.01);
		const tokenObject = {
			mint: 'So11111111111111111111111111111111111111112',
			amount: realSolBalance,
			name: 'Solana',
			symbol: 'SOL',
			logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
			extensions: {
				discord: 'https://discord.com/invite/pquxPsq',
				twitter: 'https://twitter.com/solana',
				website: 'https://solana.com/',
			},
			price,
			price_30d,
			price_60d,
			price_90d,
			pairs: solPairs.pairs,
			percent_change_24h,
			percent_change_30d,
			percent_change_60d,
			percent_change_90d,
			volume_24h,
			market_cap,
			description:
				'Solana (SOL) is a cryptocurrency launched in 2020. Solana has a current supply of 506,348,680.4303728 with 299,902,995.15039116 in circulation. The last known price of Solana is 146.68289748 USD and is up 1.09 over the last 24 hours. It is currently trading on 161 active market(s) with $2,959,138,044.47 traded over the last 24 hours. More information can be found at https://solana.com.',
			market_cap_dominance,
		};
		ownedTokensArray.push(tokenObject);
		solToken = tokenObject;
	}
	let ownedTokensSymbols = [];
	for (let i = 0; i < ownedTokens.value.length; i++) {
		const result = await connection.getParsedAccountInfo(
			ownedTokens.value[i].pubkey,
		);

		const mint = result.value.data.parsed.info.mint;
		const amount = result.value.data.parsed.info.tokenAmount.uiAmount;
		const otherDetails = await tokenMap.get(mint);
		if (otherDetails) {
			let pairs = tokenPairs.find(
				(pair: object) => pair.symbol === otherDetails.symbol,
			);

			if (!pairs) {
				pairs = { pairs: false };
			}

			const mintKey = new PublicKey(mint);

			const associatedTokenAddress = await findAssociatedTokenAddress(
				publicKey,
				mintKey,
			).catch((err) => console.log('errorr', err));

			const associatedTokenAddressHash =
				associatedTokenAddress.toString('hex');
			const tokenObject = {
				mint,
				amount,
				name: otherDetails.name,
				symbol: otherDetails.symbol,
				logo: otherDetails.logoURI,
				extensions: otherDetails.extensions,
				pairs: pairs.pairs,
				associatedTokenAddressHash,
				associatedTokenAddress,
			};
			ownedTokensArray.push(tokenObject);
			ownedTokensSymbols.push(otherDetails.symbol.toUpperCase());
		}
	}

	const filteredOwnedSymbols = ownedTokensSymbols.filter((symbol) => {
		const filter = /\d+/;
		const filteredSymbol = symbol.match(filter);
		return filteredSymbol ? false : true;
	});
	let ownedSymbolsList = filteredOwnedSymbols.join();

	let iterate = true;
	let counter = 0;
	const aboutData: Array<object> = [];

	while (counter < 10 && iterate) {
		await fetch(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${ownedSymbolsList}`,
			{
				headers: {
					'X-CMC_PRO_API_KEY': apiKey,
					Accept: 'application/json',
					'Accept-Encoding': 'deflate, gzip',
				},
			},
		)
			.then((response) => {
				return response.json();
			})
			.then((res) => {
				if (res.status.error_code !== 0) {
					if (res.status.error_message.includes('symbol')) {
						//remove the symbol causing the error
						const problemSymbol = res.status.error_message
							.split('\\')[0]
							.replace('Invalid value for ', '')
							.replace(/['"]+/g, '')
							.replace(' ', '')
							.replace('symbol', '')
							.replace(':', '')
							.replace('"', '')
							.toUpperCase();
						const index = ownedSymbolsList.indexOf(problemSymbol);
						const length = problemSymbol.length + 1;
						const newArray =
							ownedSymbolsList.substr(0, index) +
							ownedSymbolsList.substr(
								index + length,
								ownedSymbolsList.length - 1,
							);
						ownedSymbolsList = newArray;
						console.log(
							'ownedSymbolsList Fixed: ',
							ownedSymbolsList,
						);
					}
					counter++;
				} else {
					iterate = false;
					return aboutData.push(...Object.values(res.data));
				}
			})
			.catch((err) => console.log('errerere', err));
	}

	const combinedOwnedTokensArray = [];
	for (let i = 0; i < ownedTokensArray.length; i++) {
		const tokenObject = ownedTokensArray[i];
		const cmcToken = aboutData.find(
			(token: object) => token.symbol === tokenObject.symbol,
		);
		const newTokenObject = {
			description: cmcToken?.description
				? cmcToken.description
				: 'No description available',
			...tokenObject,
		};
		combinedOwnedTokensArray.push(newTokenObject);
	}
	const priceData = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${ownedSymbolsList}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': apiKey,
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => {
			return response.json();
		})
		.then((res) => {
			if (res.status.error_code !== 0) {
				return {
					description: 'No description available for this project.',
					logo: 'https://radiantwallet.s3.us-east-2.amazonaws.com/Random_Token.png',
					name: 'unkown',
					extensions: {},
				};
			} else {
				return Object.values(res.data);
			}
		})
		.catch((err) => console.log('errerere', err));

	const finalCombinedOwnedTokensArray = [];
	for (let i = 1; i < combinedOwnedTokensArray.length; i++) {
		const tokenObject = combinedOwnedTokensArray[i];
		const cmcToken = priceData.find(
			(token: object) => token.symbol === tokenObject.symbol,
		);

		if (cmcToken && cmcToken.quote) {
			const {
				price,
				percent_change_24h,
				percent_change_30d,
				percent_change_60d,
				percent_change_90d,
				volume_24h,
				market_cap,
				market_cap_dominance,
			} = cmcToken.quote.USD;
			const newTokenObject = {
				price,
				percent_change_24h,
				percent_change_30d,
				percent_change_60d,
				percent_change_90d,
				volume_24h,
				market_cap,
				market_cap_dominance,
				price_30d: price * (1 + percent_change_30d * 0.01),
				price_60d: price * (1 + percent_change_60d * 0.01),
				price_90d: price * (1 + percent_change_90d * 0.01),
				...tokenObject,
			};
			finalCombinedOwnedTokensArray.push(newTokenObject);
		} else {
			const newTokenObject = {
				price: 0,
				percent_change_24h: 0,
				percent_change_30d: 0,
				percent_change_60d: 0,
				percent_change_90d: 0,
				volume_24h: 0,
				market_cap: 0,
				market_cap_dominance: 0,
				price_30d: 0,
				price_60d: 0,
				price_90d: 0,
				...tokenObject,
			};

			finalCombinedOwnedTokensArray.push(newTokenObject);
		}
	}
	if (solToken) {
		finalCombinedOwnedTokensArray.push(solToken);
	}

	return finalCombinedOwnedTokensArray;
}

async function getAllTokensData(tokenMapSymbols: any) {
	const tokenPairs = await getTokenPairs();

	const symbolsList = await getCleanTokenList();

	const combinedSymbolList = symbolsList.join();
	const coinMarketCapTokens1 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbolList1}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			console.log('data: ', data);
			return Object.values(data.data);
		})
		.catch((err) => console.log('error', err));

	const coinMarketCapTokens2 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbolList2}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			console.log('data: ', data);
			return Object.values(data.data);
		})
		.catch((err) => console.log('error', err));

	const coinMarketCapTokens3 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbolList3}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			console.log('data: ', data);
			return Object.values(data.data);
		})
		.catch((err) => console.log('error', err));

	//combine token pairs and coinmarketcap data
	//console.log('CMC Data: ', coinMarketCapTokens)

	const combinedCmcTokensArray = [
		...coinMarketCapTokens1,
		...coinMarketCapTokens2,
		...coinMarketCapTokens3,
	];
	console.log('combinedCmcTokensArray: ', combinedCmcTokensArray);

	const combinedArray = [];
	for (let i = 0; i < combinedCmcTokensArray.length; i++) {
		const cmToken = combinedCmcTokensArray[i];

		const {
			name,
			logo,
			symbol,
			description,
			urls: { twitter, discord, website },
		} = cmToken;

		let mint;
		if (symbol === 'USDC') {
			mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
		} else {
			const mintObject = tokenMapSymbols.get(symbol);
			mint = mintObject?.address;
		}

		const newObject = {
			name,
			mint,
			logo,
			symbol,
			description,
			extensions: {
				twitter,
				discord,
				website,
			},
			pairs: [],
		};

		combinedArray.push(newObject);
	}

	// console.log('combeind array', combinedArray);

	//get and combine prices now too
	const coinMarketCapPrices1 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbolList1}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => response.json())
		.then((data) => {
			return Object.values(data.data);
		});

	const coinMarketCapPrices2 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbolList2}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => response.json())
		.then((data) => {
			return Object.values(data.data);
		});

	const coinMarketCapPrices3 = await fetch(
		`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbolList3}`,
		{
			headers: {
				'X-CMC_PRO_API_KEY': 'f7353e06-2e44-4912-9fff-05929a5681a7',
				Accept: 'application/json',
				'Accept-Encoding': 'deflate, gzip',
			},
		},
	)
		.then((response) => response.json())
		.then((data) => {
			return Object.values(data.data);
		});

	const combinedPricesArray = [
		...coinMarketCapPrices1,
		...coinMarketCapPrices2,
		...coinMarketCapPrices3,
	];

	const combinedArrayWithPrices = [];
	for (let i = 0; i < combinedArray.length; i++) {
		const element = combinedArray[i];
		const prices = combinedPricesArray.find(
			(priceSet) => priceSet.symbol === element.symbol,
		);

		const {
			percent_change_24h,
			market_cap,
			market_cap_dominance,
			percent_change_30d,
			percent_change_60d,
			percent_change_90d,
			price,
			volume_24h,
		} = prices.quote.USD;

		const price_30d = price * (1 + percent_change_30d * 0.01);
		const price_60d = price * (1 + percent_change_60d * 0.01);
		const price_90d = price * (1 + percent_change_90d * 0.01);

		const newObject = {
			...element,
			percent_change_24h,
			market_cap,
			market_cap_dominance,
			percent_change_30d,
			percent_change_60d,
			percent_change_90d,
			price_30d,
			price_60d,
			price_90d,
			price,
			volume_24h,
		};
		combinedArrayWithPrices.push(newObject);
	}
	return combinedArrayWithPrices;

	//now add market address
}

function getTokenPairs() {
	//get a clean list of all symbols in bonfida (remove all the perps ones), dedupe them, then grab their symbols, then grab their pairs, then list if it's buy side or sell side for each one

	//then make two big calls to coinmarketcap - one for data, the other for price
	//then combine all of those results based on symbol name 🎉
	return fetch('https://serum-api.bonfida.com/pairs')
		.then((res) => res.json())
		.then((res) => {
			const removedPools = res.data.filter(
				(value) =>
					![
						'-',
						'LQID',
						'ODOP',
						'xCOPE',
						'CCAI',
						'PLEB',
						'BVOL',
						'POOL',
						'BTC/SRM',
						'FTT/SRM',
						'YFI/SRM',
						'SUSHI/SRM',
						'ETH/SRM',
						'RAY/SRM',
						'RAY/ETH',
						'MSRM',
					].some((el) => value.includes(el)),
			);

			//split the pairs into separate symbols
			const symbolsArray = [];
			for (let i = 0; i < removedPools.length; i++) {
				const el = removedPools[i];
				const splitArray = el.split('/');
				symbolsArray.push(...splitArray);
			}

			//dedupe symbols
			const dedupedSymbols = [...new Set(symbolsArray)];

			//remove random hashes
			const cleanArray = [];
			for (let i = 0; i < dedupedSymbols.length; i++) {
				const el = dedupedSymbols[i];
				if (el.length < 15) {
					cleanArray.push(el);
				}
			}

			const finishedArray = [];
			for (let i = 0; i < cleanArray.length; i++) {
				const el = cleanArray[i];

				//find matching pairs
				const pairs = removedPools.filter(
					(str: string) => str.indexOf(el) >= 0,
				);
				const pairsArray = [];
				for (let i = 0; i < pairs.length; i++) {
					const el2 = pairs[i];

					//take away the name and slash
					const removeSymbol = el2.replace(el, '');
					const removeSlash = removeSymbol.replace('/', '');

					//deduce whether sell or buy side
					let side;
					removeSlash === el2.slice(0, removeSlash.length)
						? (side = 'buy')
						: (side = 'sell');

					//construct array object
					const newPair = {
						pair: el2,
						symbol: removeSlash,
						side: side,
					};

					pairsArray.push(newPair);
				}

				const finishedObject = {
					symbol: el,
					pairs: pairsArray,
				};

				finishedArray.push(finishedObject);
			}
			return finishedArray;
		})
		.catch((err) => console.log(err));
}

function getCleanTokenList() {
	return fetch('https://serum-api.bonfida.com/pairs')
		.then((res) => res.json())
		.then((res) => {
			//remove pools and dashes
			const removedDashes = res.data.filter(
				(str: string) => str.indexOf('-') === -1,
			);
			const removedToken = removedDashes.filter(
				(str: string) => str.indexOf('LQID') === -1,
			);
			const removedToken2 = removedToken.filter(
				(str: string) => str.indexOf('ODOP') === -1,
			);
			const removedToken3 = removedToken2.filter(
				(str: string) => str.indexOf('xCOPE') === -1,
			);
			const removedToken4 = removedToken3.filter(
				(str: string) => str.indexOf('CCAI') === -1,
			);
			const removedToken5 = removedToken4.filter(
				(str: string) => str.indexOf('PLEB') === -1,
			);
			const removedToken6 = removedToken5.filter(
				(str: string) => str.indexOf('FIDID') === -1,
			);
			const removedPools = removedToken6.filter(
				(str: string) => str.indexOf('POOL') === -1,
			);

			//split the pairs into separate symbols
			const symbolsArray = [];
			for (let i = 0; i < removedPools.length; i++) {
				const el = removedPools[i];
				const splitArray = el.split('/');
				symbolsArray.push(...splitArray);
			}

			//dedupe symbols
			const dedupedSymbols = [...new Set(symbolsArray)];

			//remove random hashes
			const cleanArray = [];
			for (let i = 0; i < dedupedSymbols.length; i++) {
				const el = dedupedSymbols[i];
				if (el.length < 15) {
					cleanArray.push(el);
				}
			}
			return cleanArray;
		})
		.catch((err) => console.warn(err));
}

function getTokenPair(symbol: string) {
	//are we still using this?
	return fetch('https://serum-api.bonfida.com/pairs')
		.then((res) => res.json())
		.then((res) => {
			//remove pools and dashes
			const removedDashes = res.data.filter(
				(str: string) => str.indexOf('-') === -1,
			);
			const removedToken = removedDashes.filter(
				(str: string) => str.indexOf('LIQD') === -1,
			);
			const removedPools = removedToken.filter(
				(str: string) => str.indexOf('POOL') === -1,
			);

			//clean this up to take the inputted token
			const finishedArray = [];

			//find matching pairs
			const pairs = removedPools.filter(
				(str: string) => str.indexOf(symbol) >= 0,
			);
			const pairsArray = [];
			for (let i = 0; i < pairs.length; i++) {
				const el2 = pairs[i];

				//take away the name and slash
				const removeSymbol = el2.replace(symbol, '');
				const removeSlash = removeSymbol.replace('/', '');

				//deduce whether sell or buy side
				let side;
				removeSlash === el2.slice(0, removeSlash.length)
					? (side = 'buy')
					: (side = 'sell');

				//construct array object
				const newPair = {
					pair: el2,
					symbol: removeSlash,
					side: side,
				};

				pairsArray.push(newPair);
			}

			return pairsArray;
		})
		.catch((err) => console.log(err));
}

export {
	generateMnemonic,
	mnemonicToSeed,
	accountFromSeed,
	maskedAddress,
	deriveSeed,
	deriveSeed2,
	findAssociatedTokenAddress,
	getAccountFromSeed,
	DERIVATION_PATH,
	normalizeNumber,
	shortenPublicKey,
	copyToClipboard,
	getSubWalletsData,
	getOwnedTokensData,
	getAllTokensData,
	getActiveSubWalletTokens,
	getOwnedNftsData,
};
