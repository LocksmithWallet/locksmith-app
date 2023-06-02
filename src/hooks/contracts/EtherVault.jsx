import { useLocksmithWrite } from '../Utils';


/**
 * useEtherVaultDeposit 
 *
 * Will deposit a user's ether into the ether vault on a given key. 
 */
export function useEtherVaultDeposit(keyId, amount, errorFunc, successFunc) {
  return useLocksmithWrite('EtherVault', 'deposit',
      [keyId, {value: amount}],
      amount > 0,
      errorFunc, successFunc);
}
