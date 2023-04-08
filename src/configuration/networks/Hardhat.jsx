import { hardhat } from "wagmi/chains";
import { FaHardHat } from 'react-icons/fa';

import * as contracts from '../contracts/network-contracts-31337.json';

export const HardHat = (function() {
  return {
    id: 31337, 
    wagmi: hardhat,
    label: 'Hardhat',
    icon: function(props = {}) {
      return <FaHardHat {...props} color='#ffa600'/>
    },
    contracts: contracts, 
    assets: null
  };
})();
