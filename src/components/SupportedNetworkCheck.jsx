import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';

export const SupportedNetworkCheck = ({children}) => {
  const network = useNetwork();
  const navigate = useNavigate();

  console.log(Networks.getNetwork(network.chain.id) === undefined);

  if(!(network && network.chain && network.chain.id && 
      Networks.getNetwork(network.chain.id) !== undefined)) {
        navigate('/');
        return ''
  } 

  return children
}
