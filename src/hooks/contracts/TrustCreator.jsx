import {
  useDebounce,
  useLocksmithWrite
}from '../Utils';
import {
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
} from 'wagmi';
import { Networks } from '../../configuration/Networks';
import {ethers} from 'ethers';


/**
 * useMintTrust
 *
 * Mints a Trust and a root key, and sends it to the caller. 
 */
export function useMintTrust(trustName, errorFunc, successFunc) {
  const network = useNetwork();
  return useLocksmithWrite('TrustCreator', 'spawnTrust',
      [ethers.utils.formatBytes32String(trustName.trim()), [], [], [],
        [Networks.getContractAddress(network.chain.id, 'Distributor')],
        [ethers.utils.formatBytes32String('Distributor Scribe')],
        [],
        []
      ],
      true, 
      errorFunc, successFunc);
}
