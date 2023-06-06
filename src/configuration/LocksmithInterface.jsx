import * as KeyVault from './interfaces/KeyVault.json';
import * as Locksmith from './interfaces/Locksmith.json';
import * as EtherVault from './interfaces/providers/EtherVault.json';
import * as TokenVault from './interfaces/providers/TokenVault.json';
import * as Notary from './interfaces/Notary.json';
import * as Ledger from './interfaces/Ledger.json';
import * as PostOffice from './interfaces/PostOffice.json';
import * as Distributor from './interfaces/scribes/Distributor.json';
import * as TrustCreator from './interfaces/agents/TrustCreator.json';
import * as VirtualKeyAddress from './interfaces/agents/VirtualKeyAddress.json';
import * as ShadowERC from './interfaces/ShadowERC.json';
import { ethers } from 'ethers';

export const LocksmithInterface = (function() {
  const interfaces = {
    'KeyVault': KeyVault,
    'Locksmith': Locksmith,
    'EtherVault': EtherVault,
    'TokenVault': TokenVault,
    'Notary': Notary,
    'Ledger': Ledger,
    'Distributor': Distributor,
    'PostOffice': PostOffice,
    'TrustCreator': TrustCreator,
    'VirtualKeyAddress': VirtualKeyAddress,
    'ShadowERC': ShadowERC,
  };

  const eventDictionary = Object.keys(interfaces).reduce((memo, next, index) => {
    interfaces[next].abi.filter((f) => f.type === 'event').forEach((event) => {
      memo[ethers.utils.id([event.name, '(', event.inputs.map((i) => i.type), ')'].join(''))] =
        {... event, contractName: next};
    });
    return memo;
  }, {});

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
    // getEventDictionary
    //
    // Returns a hash of (contract => method => {signature, abi})
    // for all contracts defined in the interface.
    //////////////////////////
    getEventDictionary: function() {
      return eventDictionary;
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
