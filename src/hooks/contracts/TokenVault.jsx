import { useNetwork, useContractRead } from 'wagmi';
import { Networks } from '../../configuration/Networks';
import { useLocksmithWrite } from '../Utils';
import { LocksmithInterface } from '../../configuration/LocksmithInterface';

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

export function useTokenVaultAllowance(tokenAddress, userAddress) {
  const network = useNetwork();
  const connected = network && network.chain && network.chain.id;
  const config = Networks.getNetwork(connected ? network.chain.id : null);
  return useContractRead({
    address: tokenAddress, 
    abi: LocksmithInterface.getAbi('ShadowERC').abi,
    functionName: 'allowance',
    args: [userAddress, connected ? config.contracts['TokenVault'].address : ethers.constants.AddressZero],
    enabled: userAddress && tokenAddress && connected,
    watch: true 
  });
}
