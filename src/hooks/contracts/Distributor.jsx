import {
  useLocksmithWrite
}from '../Utils';
import {ethers} from 'ethers';

/**
 * useDistribute 
 *
 * Uses the signature as a key holder to distribute funds
 * to other keys within their trust.
 */
export function useDistribute(provider, arn, sourceKeyId, keys, amounts, errorFunc, successFunc) {
  return useLocksmithWrite('Distributor', 'distribute',
      [provider, arn, sourceKeyId, keys, amounts],
      provider !== null && arn !== null && sourceKeyId !== null && keys.length > 0 && amounts.length > 0, 
      errorFunc, successFunc);
}
