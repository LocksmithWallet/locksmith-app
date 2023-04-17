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
    // getContractAddress
    //
    // For a given network id, will return
    // the contract address.
    //////////////////////////
    getContractAddress: function(networkId, contract) {
      return networks[networkId].contracts[contract].address;
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
    // getAsset
    //
    // Equivalent to Networks.getNetwork(chainId).assets[arn]
    //////////////////////////
    getAsset: function(networkId, arn) {
      return networks[networkId].assets[arn];
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
