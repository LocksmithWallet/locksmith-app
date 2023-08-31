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
 * useRecoveryPolicyCreator 
 *
 * Sets up a master key recovery policy with recovery addresses 
 * and event configuration.
 */
export function useRecoveryPolicyCreator(rootKeyId, needsAlarm, needsOracle, guardians, deadmen, oracles, errorFunc, successFunc) {
  const { address } = useAccount();
  const network = useNetwork();
  const policyCreatorAddress = Networks.getContractAddress(network.chain.id, 'RecoveryPolicyCreator');
  const keyLockerAddress = Networks.getContractAddress(network.chain.id, 'KeyLocker');
  const locksmithAddress = Networks.getContractAddress(network.chain.id, 'Locksmith');
  const needsRepair = useNeedsRootKeyLockerRepair(address, rootKeyId).needsRepair();

  // encode the data for the policy creation
  var data = ethers.utils.defaultAbiCoder.encode(
    ['tuple(bool,bool,address[],tuple(bytes32,uint256,uint256,uint256)[],tuple(bytes32,uint256)[])'],
    [[true, false, guardians, deadmen, oracles]]);

  // if we need to repair the key, prepare that data too
  var repairData = ethers.utils.defaultAbiCoder.encode(
    ['tuple(address,bytes)'],
    [[policyCreatorAddress, data]]);

  return useLocksmithWrite(needsRepair ? 'KeyVault' : 'KeyLocker', // mode of action here for repair or not
    needsRepair ? 'safeTransferFrom' : 'useKeys', // do we transfer the key to the locker, or call useKey to delegate?
    needsRepair ? [address, keyLockerAddress, rootKeyId, 1, repairData] : // send the key to the key locker with repair and execution instructions
      [locksmithAddress, rootKeyId, 1, policyCreatorAddress, data],       // or just send the instructions using useKey
      rootKeyId !== null && (deadmen.length + oracles.length) > 0,
      errorFunc, successFunc);
}
