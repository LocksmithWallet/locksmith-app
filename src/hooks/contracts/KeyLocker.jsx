import {
  useEffect,
  useState,
} from 'react';
import {
  useNetwork,
} from 'wagmi';
import { Networks } from '../../configuration/Networks';

import {
  useSoulboundKeyRequirement,
  useKeyBalance,
} from './KeyVault';


////////////////////////////////////////////////
// KeyLocker 
//
// Increase your security posture by using key locker 
////////////////////////////////////////////////

/**
 * useNeedsRootKeyLockerRepair 
 *
 * For a given address and key id, determine if the user 
 * needs a root key locker.
 * 
 * This is defined by:
 * + Holding an unbound root key
 * + Missing a root key locker
 *
 * Root key actions that require key delegations (sending keys to contract)
 * should always be done from the key locker which requires it's return.
 * Root key end users should always operate with soulbound keys to prevent
 * malicious theft.
 */
export function useNeedsRootKeyLockerRepair(address, keyId ) {
  const network = useNetwork();
  const [semaphore, setSemaphore] = useState({
    needsRepair: function() {
      // return true, false, or null if we don't know
      return (this.boundCount && this.keyBalance && this.lockerBalance) ?
        this.boundCount.lt(1) && this.keyBalance.gt(0) && this.lockerBalance.eq(0) : null;
    }
  });

  // get the soulbound requirement for that address
  const boundCount = useSoulboundKeyRequirement(keyId, address);

  // get the actual key balance of the address
  const keyBalance = useKeyBalance(keyId, address); 

  // determine if there is a key locker for the key
  const lockerBalance = useKeyBalance(keyId, Networks.getContractAddress(network.chain.id, 'KeyLocker'));

  useEffect(() => {
    if(boundCount.data) {
      setSemaphore((prev) => {
        var sema = {... prev};
        sema.boundCount = boundCount.data;
        return sema;
      });
    }
  }, [boundCount.data]);
  
  useEffect(() => {
    if(keyBalance.data) {
      setSemaphore((prev) => {
        var sema = {... prev};
        sema.keyBalance = keyBalance.data;
        return sema;
      });
    }
  }, [keyBalance.data]);
  
  useEffect(() => {
    if(lockerBalance.data) {
      setSemaphore((prev) => {
        var sema = {... prev};
        sema.lockerBalance = lockerBalance.data;
        return sema;
      });
    }
  }, [lockerBalance.data]);

  return semaphore;
}
