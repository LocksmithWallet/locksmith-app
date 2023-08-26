import {
  useLocksmithWrite
} from '../Utils';
import {
  useAccount,
  useNetwork,
} from 'wagmi';
import {ethers} from 'ethers';
import { Networks } from '../../configuration/Networks';
import { useNeedsRootKeyLockerRepair } from './KeyLocker';

/**
 * useMegaKeyCreator
 *
 * This method will take in all of the parameters needed and:
 * - create a key, send it to the receiver.
 * - create an inbox, copy a key, and soulbind it to the inbox
 */
export function useMegaKeyCreator(rootKeyId, keyAlias, receivers, bound, errorFunc, successFunc) {
  const { address } = useAccount();
  const network = useNetwork();
  const megaKeyAddress = Networks.getContractAddress(network.chain.id, 'MegaKeyCreator');
  const keyLockerAddress = Networks.getContractAddress(network.chain.id, 'KeyLocker');
  const locksmithAddress = Networks.getContractAddress(network.chain.id, 'Locksmith');
  const needsRepair = useNeedsRootKeyLockerRepair(address, rootKeyId).needsRepair();

  // this will likely break when this assumption fails, but we are going to assume the default
  // ethereum collateral provider is EtherVault
  const provider = Networks.getContractAddress(network.chain.id, 'EtherVault');

  // encode the data for the mega key creator
  var data = ethers.utils.defaultAbiCoder.encode(
    ['bytes32','address','address[]','bool[]'],
    [ethers.utils.formatBytes32String(keyAlias), provider, receivers, bound]);

  var repairData = ethers.utils.defaultAbiCoder.encode(
    ['tuple(address,bytes)'],
    [[megaKeyAddress, data]]);

  return useLocksmithWrite(needsRepair ? 'KeyVault' : 'KeyLocker', // if its needs repair, you're sending the key to the locker 
      needsRepair ? 'safeTransferFrom' : 'useKeys',                // if it doesn't, your calling useKey on the locker
      needsRepair ? [address, keyLockerAddress, rootKeyId, 1, repairData] : // you want to send key to the locker with the instructions
        [locksmithAddress, rootKeyId, 1, megaKeyAddress, data],             // or just send the instructions using useKey
      rootKeyId !== null && provider !== null && receivers !== null && needsRepair !== null,
      errorFunc, successFunc);
}
