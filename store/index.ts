import {
	Generic,
	generic,
	Computed,
	computed,
	createStore,
	action,
	Action,
	persist,
} from 'easy-peasy';
import storage from '../storage';

const store = createStore({
	account: '',
	passcode: '',
	updatePasscode: action((state, payload) => {
		state.passcode = payload;
	}),
	updateAccount: action((state, payload) => {
		state.account = payload;
	}),
	ownedTokens: '',
	allTokens: '',
	setOwnedTokens: action((state, payload) => {
		state.ownedTokens = payload;
	}),
	setAllTokens: action((state, payload) => {
		state.allTokens = payload;
	}),
	selectedWallet: 0,
	setSelectedWallet: action((state, payload) => {
		state.selectedWallet = payload;
	}),
	activeSubWallet: 0,
	setActiveSubWallet: action((state, payload) => {
		state.activeSubWallet = payload;
	}),
	subWallets: '',
	setSubWallets: action((state, payload) => {
		state.subWallets = payload;
	}),
	subWalletTokensArray: '',
	setSubWalletTokensArray: action((state, payload) => {
		state.subWalletTokensArray = payload;
	}),
	finalSubWallets: '',
	setFinalSubWallets: action((state, payload) => {
		state.finalSubWallets = payload;
	}),
	tokenMap: '',
	setTokenMap: action((state, payload) => {
		state.tokenMap = payload;
	}),
	tokenPairs: '',
	setTokenPairs: action((state, payload) => {
		state.tokenPairs = payload;
	}),
	web3Connection: '',
	setWeb3Connection: action((state, payload) => {
		state.web3Connection = payload;
	}),
	firstLoadedTokens: '',
	setFirstLoadedTokens: action((state, payload) => {
		state.firstLoadedTokens = payload;
	}),
	subWalletNftsArray: '',
	setSubWalletNftsArray: action((state, payload) => {
		state.subWalletNftsArray = payload;
	}),
});

export default store;
