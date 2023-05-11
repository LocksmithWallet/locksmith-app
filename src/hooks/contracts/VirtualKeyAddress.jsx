import {
  useLocksmithWrite
}from '../Utils';
import {
  useNetwork,
} from 'wagmi';
import { Networks } from '../../configuration/Networks';
import {ethers} from 'ethers';

/**
 * useSend 
 *
 *  Sends ethereum from an inbox to another EOA.
 */
export function useSend(inboxAddress, provider, amount, destination, errorFunc, successFunc) {
  const network = useNetwork();
  return useLocksmithWrite('VirtualKeyAddress', 'send',
      [provider, amount, destination],
      inboxAddress && (provider !== null) && amount && amount.gt(0) && (destination !== null),
      errorFunc, successFunc, inboxAddress);
}

/**
 * useSendToken
 *
 * Sends an ERC20 from the token vault to an external address 
 */
export function useSendToken(inboxAddress, provider, token, amount, destination, errorFunc, successFunc) {
  const network = useNetwork();
  return useLocksmithWrite('VirtualKeyAddress', 'sendToken',
      [provider, token, amount, destination],
      inboxAddress && (provider !== null) && amount && token && amount.gt(0) && (destination !== null),
      errorFunc, successFunc, inboxAddress);
}
