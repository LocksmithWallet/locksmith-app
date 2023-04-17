import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useLocksmithRead } from '../Utils';

//////////////////////////////////////////////
// Notary Roles
//////////////////////////////////////////////
export const LEDGER_CONTEXT = 0;
export const TRUST_CONTEXT  = 1;
export const KEY_CONTEXT    = 2;

/**
 * useContextBalanceSheet
 *
 * Calls the Ledger, and for a given context returns
 * both the arns and the balances of those arns, or per-provider
 * within the context if provided.
 */
export function useContextBalanceSheet(context, context_id, collateralProvider = ethers.constants.AddressZero) {
  return useLocksmithRead('Ledger', 'getContextBalanceSheet', [context, context_id, collateralProvider],
    true, true);
}
