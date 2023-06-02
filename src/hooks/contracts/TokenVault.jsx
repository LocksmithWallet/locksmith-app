import { useLocksmithWrite } from '../Utils';


/**
 * useTokenVaultDeposit
 *
 * Will deposit a user's ERC20 into the token vault on a given key. 
 */
export function useTokenVaultDeposit(keyId, token, amount, errorFunc, successFunc) {
  return useLocksmithWrite('TokenVault', 'deposit',
      [keyId, token, amount], 
      amount > 0,
      errorFunc, successFunc);
}
