import { hardhat } from "wagmi/chains";
import { FaHardHat } from 'react-icons/fa';
import { 
  GAS_ARN,
  getAssetResourceName,
} from '../AssetResource';



import * as contracts from '../contracts/network-contracts-31337.json';
import * as assets from '../assets/network-assets-31337.json';

import { ETH } from '../../components/icons/ETH';
import { LINK } from '../../components/icons/LINK';
import { USDC } from '../../components/icons/USDC';

export const HardHat = (function() {
  return {
    id: 31337, 
    wagmi: hardhat,
    label: 'Hardhat',
    icon: function(props = {}) {
      return <FaHardHat {...props} color='#ffa600'/>
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
      return "https://etherscan.io"; // nothing locally right now?
    },
    getTransactionExplorerUrl: function(txn) {
      return "https://etherscan.io"; // nothing locally right now?
    }
  };
})();
