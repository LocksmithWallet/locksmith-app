import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';

export const SupportedNetworkCheck = ({children}) => {
  const network = useNetwork();
  const navigate = useNavigate();
  const location = useLocation();
 
  if(location.pathname !== '/' && !(network && network.chain && network.chain.id && 
      Networks.getNetwork(network.chain.id) !== undefined)) {
        navigate('/');
        return ''
  } 

  return children;
}

export const OnlyOnChains = ({chains, children}) => {
  const network = useNetwork();

  if(chains.includes(network.chain.id)) {
    return children;
  }

  return '';
}
