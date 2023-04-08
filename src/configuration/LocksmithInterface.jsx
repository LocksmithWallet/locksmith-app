import * as TrustCreator from './interfaces/agents/TrustCreator.json';

export const LocksmithInterface = (function() {
  var interfaces = {
    'TrustCreator': TrustCreator 
  };

  return {
    //////////////////////////
    // getAbi 
    // 
    // Returns the contract interface for a given name, 
    //////////////////////////
    getAbi: function(name) {
      return interfaces[name]; 
    }
  }
})();
