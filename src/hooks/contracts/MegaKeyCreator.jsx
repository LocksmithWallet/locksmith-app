import {
  useLocksmithWrite
} from '../Utils';
import {
  useAccount,
  useNetwork,
} from 'wagmi';
import {ethers} from 'ethers';
import { Networks } from '../../configuration/Networks';

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

  // this will likely break when this assumption fails, but we are going to assume the default
  // ethereum collateral provider is EtherVault
  const provider = Networks.getContractAddress(network.chain.id, 'EtherVault');

  // encode the data
  var data = ethers.utils.defaultAbiCoder.encode(
    ['bytes32','address','address[]','bool[]'],
    [ethers.utils.formatBytes32String(keyAlias), provider, receivers, bound]);

   return useLocksmithWrite('KeyVault', 'safeTransferFrom',
      [address, megaKeyAddress, rootKeyId, 1, data],
      rootKeyId !== null && provider !== null && receivers !== null,
      errorFunc, successFunc);
}
