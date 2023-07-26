import { BaseIcon } from '../../components/icons/Base.jsx';
import {
  GAS_ARN,
  getAssetResourceName,
} from '../AssetResource';

import * as contracts from '../contracts/network-contracts-8453.json';

import { ETH } from '../../components/icons/ETH';

export const Base = (function() {
  return {
    id: 8453, 
    wagmi: {
      id: 8453,
      name: 'Base',
      network: 'Base',
      nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH'
      },
      rpcUrls: {
        default: {http: ['https://developer-access-mainnet.base.org']}
      }
    },
    label: 'Base',
    icon: function(props = {}) {
      return <BaseIcon {...props}/>
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
      return "https://basescan.org/address/" + address;
    },
    getTransactionExplorerUrl: function(txn) {
      return "https://basescan.org/tx/" + txn; 
    }
  };
})();
