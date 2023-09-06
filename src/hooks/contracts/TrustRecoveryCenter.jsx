import {
  useDebounce,
  useLocksmithRead,
  useLocksmithWrite
}from '../Utils';
import {
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
} from 'wagmi';
import {
  useState,
  useEffect,
} from 'react';
import { Networks } from '../../configuration/Networks';
import {ethers} from 'ethers';

/**
 * useRecoveryPolicy
 *
 * For a given key ID, return the recovery policy configuration for it. 
 */
export function useRecoveryPolicy(keyId) {
  const [policyData, setPolicyData] = useState(null);
  const policy = useLocksmithRead('TrustRecoveryCenter', 'getRecoveryPolicy', [keyId], keyId !== null !== '', true);

  useEffect(() => {
    if (!policy.data) { return; }

    setPolicyData({
      isValid: policy.data[0],
      recoverKey: keyId,
      guardians: policy.data[1],
      events: policy.data[2]
    });
  }, [policy.data]);

  return policyData;
}

/**
 * useGuardianPolicies
 *
 * Given a specific address, find all of the root key policies they are recovery
 * addresses for.
 */
export function useGuardianPolicies(address) {
  return useLocksmithRead('TrustRecoveryCenter', 'getGuardianPolicies', [address], address, true);
}

/**
 * useChangeGuardians
 *
 * A root key holder can call this to add or remove guardian recovery addresses
 * from the recovery policy.
 *
 */
export function useChangeGuardians(rootKeyId, addresses, addOrRemove, errorFunc, successFunc) {
  return useLocksmithWrite('TrustRecoveryCenter', 'changeGuardians',
      [rootKeyId, addresses, addOrRemove],
      rootKeyId !== null && addresses !== null && addresses.length !== 0 && addOrRemove !== null,
      errorFunc, successFunc);
}

/**
 * useRecoverKey
 *
 * Attempt to recover a trust's root key.
 */
export function useRecoverKey(keyId, errorFunc, successFunc) {
  return useLocksmithWrite('TrustRecoveryCenter', 'recoverKey', 
    [keyId], keyId, errorFunc, successFunc);
}
