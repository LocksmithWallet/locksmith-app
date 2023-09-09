import { ScrollIcon } from '../../components/icons/Scroll.jsx';
import {
  GAS_ARN,
  getAssetResourceName,
} from '../AssetResource';

import * as contracts from '../contracts/network-contracts-534351.json';
import * as assets from '../assets/network-assets-534351.json';

import { ETH } from '../../components/icons/ETH';
import { LINK } from '../../components/icons/LINK';
import { USDC } from '../../components/icons/USDC';

export const scrollSepoliaChain = {
  id: 534_351,
  name: 'Scroll Sepolia',
  network: 'scroll-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io'],
      webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io'],
      webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.scroll.io',
    },
  },
  testnet: true,
};

export const ScrollSepolia = (function() {
  return {
    id: 534351, 
    wagmi: scrollSepoliaChain,
    label: 'Scroll Sepolia',
    icon: function(props = {}) {
      return <ScrollIcon {...props}/>
    },
    contracts: contracts,
    assets: (function() {
      var list = {};

      list[GAS_ARN] = {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        contractAddress: null,
        standard: 0,
        id: 0,
        coinCapId: 'ethereum',
        icon: function(props = {}) {
          return <ETH {...props} color='#716b94'/>;
        }
      }

      list[getAssetResourceName(assets['link'].address, 20, 0)] = {
        name: 'Chainlink',
        symbol: 'LINK',
        decimals: 18,
        contractAddress: assets['link'].address,
        standard: 20,
        id: 0,
        coinCapId: 'chainlink',
        icon: function(props = {}) {
          return <LINK {...props} color='#375BD2'/>;
        }
      };

      list[getAssetResourceName(assets['usdc'].address, 20, 0)] = {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 18,
        contractAddress: assets['usdc'].address,
        standard: 20,
        id: 0,
        coinCapId: 'usd-coin',
        icon: function(props = {}) {
          return <USDC color='#2775ca' {...props}/>;
        }
      };

      return list;
    })(),
    getAddressExplorerUrl: function(address) {
      return "https://sepolia-blockscout.scroll.io/address/" + address;
    },
    getTransactionExplorerUrl: function(txn) {
      return "https://sepolia-blockscout.scroll.io/tx/" + txn; 
    }
  };
})();
