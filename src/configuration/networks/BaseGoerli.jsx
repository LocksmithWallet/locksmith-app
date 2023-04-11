import { baseGoerli } from "wagmi/chains";
import { BaseIcon } from '../../components/icons/Base.jsx';

import * as contracts from '../contracts/network-contracts-84531.json';

export const BaseGoerli = (function() {
  return {
    id: 84531, 
    wagmi: baseGoerli,
    label: 'Base Goerli',
    icon: function(props = {}) {
      return <BaseIcon {...props}/>
    },
    contracts: contracts, 
    assets: null
  };
})();
