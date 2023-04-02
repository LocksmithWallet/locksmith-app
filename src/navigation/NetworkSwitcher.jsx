import React from 'react';
import { 
  Button
} from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { FaMoon, FaSun } from 'react-icons/fa';

export const NetworkSwitcher = () => {
  const network = useNetwork();
  return network && network.chain ? (
    <Button size='sm' leftIcon={Networks.getNetwork(network.chain.id).icon({size: 16})}>
      { Networks.getNetwork(network.chain.id).label }
    </Button>
  ) : <></> ;
};
