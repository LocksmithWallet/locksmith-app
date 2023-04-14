import * as KeyVault from './interfaces/KeyVault.json';
import * as Locksmith from './interfaces/Locksmith.json';
import * as PostOffice from './interfaces/PostOffice.json';
import * as TrustCreator from './interfaces/agents/TrustCreator.json';
import { ethers } from 'ethers';

export const LocksmithInterface = (function() {
  var interfaces = {
    'KeyVault': KeyVault,
    'Locksmith': Locksmith,
    'PostOffice': PostOffice,
    'TrustCreator': TrustCreator 
  };

  return {
    //////////////////////////
    // getAbi 
    // 
    // Returns the contract interface for a given name, 
    //////////////////////////
    getAbi: function(contract) {
      return interfaces[contract]; 
    },
    //////////////////////////
    // getEventSignature
    //
    // For a given contract and event name, provides
    // the ethers event structure. 
    //////////////////////////
    getEventDefinition: function(contract, eventName) {
      return interfaces[contract].abi.filter(
        (f) => f.type === 'event' && f.name === eventName)[0];
    }
  }
})();
