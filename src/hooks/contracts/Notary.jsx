import { useAccount } from 'wagmi';
import { useLocksmithRead } from '../Utils';

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
