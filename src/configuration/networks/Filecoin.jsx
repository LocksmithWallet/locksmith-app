import { filecoin } from 'wagmi/chains';
import { FIL } from '../../components/icons/FIL';

export const Filecoin = (function() {
  return {
    id: 314, 
    wagmi: filecoin,
    label: 'Filecoin',
    icon: function(props = {}) {
      return <FIL color='#0090FF' {...props}/>; 
    },
    contracts: null,
    assets: null
  };
})();
