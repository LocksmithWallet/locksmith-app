import { baseGoerli } from "wagmi/chains";
import { BaseIcon } from '../../components/icons/Base.jsx';
import { GAS_ARN } from '../AssetResource';

import * as contracts from '../contracts/network-contracts-84531.json';

import { ETH } from '../../components/icons/ETH';

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
