import { useLocksmithRead } from '../Utils';

/**
 * useKeyInboxAddress
 *
 * For a given keyId, return the virtual inbox address should
 * there be one, otherwise null.
 */
export function useKeyInboxAddress(keyId) {
  return useLocksmithRead('PostOffice', 'getKeyInbox', [keyId], keyId !== null, false); 
}
