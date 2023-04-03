export const Networks = (function() {
  var networks = {}; 
  return {
    //////////////////////////
    // addNetwork
    //
    // Will add a supported network to the application.
    //////////////////////////
    addNetwork: function(network) {
      networks[network.id] = network;
    },
    //////////////////////////
    // getNetwork
    // 
    // Return the network based on the chain ID.
    //////////////////////////
    getNetwork: function(networkId) {
      return networks[networkId];
    },
    //////////////////////////
    // getSupportedNetworks
    //
    // Returns a list of all supported networks.
    //////////////////////////
    getSupportedNetworks: function() {
      return Object.values(networks);
    },
    //////////////////////////
    // wagmiChains
    //
    // Returns a prioritized list of chain infos
    // for wagmi. This ordering will determine
    // the preference for network connections.
    //////////////////////////
    wagmiChains: function() {
      return Object.values(networks).map((n) => n.wagmi);
    }
  }
})();
