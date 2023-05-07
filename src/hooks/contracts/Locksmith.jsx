import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useLocksmithRead } from '../Utils';

/**
 * useWalletKeys
 *
 * This hook takes a wallet address, and uses
 * either the attached account or the given address
 * to produce a list of key IDs held by the address
 * using the KeyVault.
 *
 * @param address an optional address to get the keys from
 * @return a query that returns the key Ids
 */
export function useWalletKeys(address) {
  const account    = useAccount();
  const wallet     = address || account.address;
  return useLocksmithRead('KeyVault', 'getKeys', [wallet], wallet !== null, true); 
}

/**
 * useInspectKey
 *
 * Calls inspect key for a given keyId.
 */
export function useInspectKey(keyId) {
  const [keyData, setKeyData] = useState(null);
  const inspectKey = useLocksmithRead('Locksmith', 'inspectKey', [keyId], keyId !== null || keyId !== '', false); 
  
  useEffect(() => {
    if (!inspectKey.data) { return; }

    setKeyData({
      isValid: inspectKey.data[0],
      keyId: keyId,
      alias: ethers.utils.parseBytes32String(inspectKey.data[1]),
      trustId: inspectKey.data[2],
      isRoot: inspectKey.data[3],
      trustKeys: inspectKey.data[4]
    });
  }, [inspectKey.data]);

  return keyData;
}

/**
 * useTrustInfo
 *
 * Takes a trust ID, and grabs a lot of information
 * about it to build a trust detail page.
 *
 * @param trustId the trust id to intospect
 * @return {
 *    trustId,
 *    name,
 *    rootKeyId,
 *    trustKeyCount
 *    keys[]
 * }
 */
export function useTrustInfo(trustId) {
  const [trustData, setTrustData] = useState(null);
  const trust = useLocksmithRead('Locksmith', 'getTrustInfo', [trustId], trustId !== null, true);

  useEffect(() => {
    if (!trust.data) { return; }

    setTrustData({
      trustId: trust.data[0],
      name: ethers.utils.parseBytes32String(trust.data[1]),
      rootKeyId: trust.data[2],
      trustKeyCount: trust.data[3]
    });
  }, [trust.data]);

  return trustData;
}
