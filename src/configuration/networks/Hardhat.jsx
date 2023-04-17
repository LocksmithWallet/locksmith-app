import { hardhat } from "wagmi/chains";
import { FaHardHat } from 'react-icons/fa';
import { GAS_ARN } from '../AssetResource';

import * as contracts from '../contracts/network-contracts-31337.json';

import { ETH } from '../../components/icons/ETH';

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

      return list;
    })(),
    getAddressExplorerUrl: function(address) {
      return "https://etherscan.io"; // nothing locally right now?
    }
  };
})();
