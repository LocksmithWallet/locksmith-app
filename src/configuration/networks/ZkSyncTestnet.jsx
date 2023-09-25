import { ScrollIcon } from '../../components/icons/Scroll.jsx';
import {
  GAS_ARN,
  getAssetResourceName,
} from '../AssetResource';

import * as contracts from '../contracts/network-contracts-280.json';

import { ETH } from '../../components/icons/ETH';

export const zkSyncTestnet = {
  id: 280,
  name: 'zkSync Era Testnet',
  network: 'zksync-era-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.era.zksync.dev'],
      webSocket: ['wss://testnet.era.zksync.dev/ws'],
    },
    public: {
      http: ['https://testnet.era.zksync.dev'],
      webSocket: ['wss://testnet.era.zksync.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkExplorer',
      url: 'https://goerli.explorer.zksync.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
  testnet: true,
};

export const ZkSyncTestnet = (function() {
  return {
    id: 280, 
    wagmi: zkSyncTestnet,
    label: 'zkSync Testnet',
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

      return list;
    })(),
    getAddressExplorerUrl: function(address) {
      return "https://goerli.explorer.zksync.io/" + address;
    },
    getTransactionExplorerUrl: function(txn) {
      return "https://goerli.explorer.zksync.io/tx/" + txn; 
    }
  };
})();
