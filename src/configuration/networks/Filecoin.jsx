import { filecoin } from 'wagmi/chains';
import { FIL } from '../../components/icons/FIL';
import { GAS_ARN } from '../AssetResource';

import * as contracts from '../contracts/network-contracts-314.json';

export const Filecoin = (function() {
  return {
    id: 314, 
    wagmi: filecoin,
    label: 'Filecoin',
    icon: function(props = {}) {
      return <FIL color='#0090FF' {...props}/>; 
    },
    contracts: contracts,
    assets: (function() {
      var list = {};

      list[GAS_ARN] = {
        name: 'Filecoin',
        symbol: 'FIL',
        decimals: 18,
        contractAddress: null,
        standard: 0,
        id: 0,
        coinCapId: 'filecoin',
        icon: function(props = {}) {
          return <FIL {...props} color='#0090FF'/>; 
        }
      }

      return list;
    })(),
    getAddressExplorerUrl: function(address) {
      return "https://filfox.info/en/address/" + address;
    }
  };
})();
