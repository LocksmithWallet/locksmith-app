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
 * useRecoveryPolicyCreator 
 *
 * Sets up a master key recovery policy with recovery addresses 
 * and event configuration.
 */
export function useRecoveryPolicyCreator(rootKeyId, needsAlarm, needsOracle, guardians, deadmen, oracles, errorFunc, successFunc) {
  const { address } = useAccount();
  const network = useNetwork();
  const policyCreatorAddress = Networks.getContractAddress(network.chain.id, 'RecoveryPolicyCreator');

  // encode the data
  var data = ethers.utils.defaultAbiCoder.encode(
    ['tuple(bool,bool,address[],tuple(bytes32,uint256,uint256,uint256)[],tuple(bytes32,uint256)[])'],
    [[true, false, guardians, deadmen, oracles]]);

  return useLocksmithWrite('KeyVault', 'safeTransferFrom',
      [address, policyCreatorAddress, rootKeyId, 1, data],
      rootKeyId !== null && (deadmen.length + oracles.length) > 0,
      errorFunc, successFunc);
}
