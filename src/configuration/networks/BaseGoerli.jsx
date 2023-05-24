import { baseGoerli } from "wagmi/chains";
import { BaseIcon } from '../../components/icons/Base.jsx';
import {
  GAS_ARN,
  getAssetResourceName,
} from '../AssetResource';

import * as contracts from '../contracts/network-contracts-84531.json';
import * as assets from '../assets/network-assets-84531.json';

import { ETH } from '../../components/icons/ETH';
import { LINK } from '../../components/icons/LINK';
import { USDC } from '../../components/icons/USDC';

export const BaseGoerli = (function() {
  return {
    id: 84531, 
    wagmi: baseGoerli,
    label: 'Base Goerli',
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
        decimals: 6,
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
      return "https://goerli.basescan.org/address/" + address;
    },
    getTransactionExplorerUrl: function(txn) {
      return "https://goerli.basescan.org/tx/" + txn; 
    }
  };
})();
