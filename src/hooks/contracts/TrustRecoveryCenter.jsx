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
