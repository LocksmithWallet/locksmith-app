import { useAccount } from 'wagmi';
import { useLocksmithRead } from '../Utils';

/**
 * getTrustedActors
 *
 * Determine what actors have approved roles in the notary.
 */
export function useTrustedActors(ledger, trustId, role) {
  return useLocksmithRead('Notary', 'getTrustedActors', 
    [ledger, trustId, role], 
    ledger && trustId && role, 
    false); 
}

/**
 * useTrustedActorAlias
 *
 * Gets the human readable name of an actor.
 *
 */
export function useTrustedActorAlias(trustId, role, actor, ledger) {
  return useLocksmithRead('Notary', 'actorAliases', 
    [ledger, trustId, role, actor], 
    ledger && trustId && role && actor, 
    false); 
}
