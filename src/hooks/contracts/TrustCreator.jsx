import {
  useDebounce,
  useLocksmithWrite
}from '../Utils';
import {
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';


/**
 * useMintTrust
 *
 * Mints a Trust and a root key, and sends it to the caller. 
 */
export function useMintTrust(trustName, errorFunc, successFunc) {
  return useLocksmithWrite('TrustCreator', 'spawnTrust',
      [ethers.utils.formatBytes32String(trustName.trim()), [], [], []],
      true, 
      errorFunc, successFunc);
}
