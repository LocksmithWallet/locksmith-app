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
  return useLocksmithRead('KeyVault', 'getKeys', [wallet], wallet != null, true); 
}
