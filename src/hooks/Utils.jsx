import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  useAccount,
  useFeeData,
  useNetwork,
  usePrepareContractWrite,
  useContract,
  useContractRead,
  useContractWrite,
  useProvider,
} from 'wagmi';
import { Networks } from '../configuration/Networks';
import { LocksmithInterface } from '../configuration/LocksmithInterface';

export function getReceiptEvents(receipt, contract, eventName) {
  // grab the event definition from the ABI
  const definition = LocksmithInterface.getEventDefinition(contract, eventName);

  // translate this into the ethers topic signature
  const eventTopics = definition.inputs.map((i) => i.type);
  const eventSignature = ethers.utils.id(
    [eventName, '(', eventTopics.join(','), ')'].join('')
  );

  // translate the events into named hashes
  return receipt.logs.filter((log) => log.topics[0] === eventSignature).map((e) => {
    // decode the event data based on the event topics.
    const parsedEvent = ethers.utils.defaultAbiCoder.decode(eventTopics, e.data);

    // build a hash of the actual topic names and values
    return definition.inputs.reduce((memo, next, index) => {
      memo[next.name] = parsedEvent[index]; 
      return memo
    }, {});
  });
}

export function getLocksmithEvents(receipt) {
  const dictionary = LocksmithInterface.getEventDictionary();
  return (receipt !== null ? receipt.logs :[]).reduce((memo, next, i) => {
    const definition = dictionary[next.topics[0]];
    if (definition) {
      const parsedEvent  = ethers.utils.defaultAbiCoder.decode(
        definition.inputs.filter((input) => !input.indexed)
          .map((i) => i.type), next.data);
      const parsedTopics = definition.inputs.filter((input) => input.indexed)
        .map((input, index) => (ethers.utils.defaultAbiCoder.decode([input.type], next.topics[index+1])[0]));
     
      // merge in all of the proper values
      var e = definition.inputs.filter((input)=> input.indexed).reduce((values, topic, index) => {
        values.topics[topic.name] = parsedTopics[index];
        return values;
      }, {name: definition.name, topics: {}, contract: definition.contractName});
      definition.inputs.filter((input)=> !input.indexed).forEach((topic, index) => {
        e.topics[topic.name] = parsedEvent[index];
      });
      memo.push(e);
    } else {
      console.log("missing event: ");
      console.log(next);
    }
    return memo;
  }, []);
};

export function useSupportedTokens() {
  const network = useNetwork();
  const assets = Networks.getNetwork(network.chain.id).assets;
  return Object.keys(assets).reduce((m, n, x) => {
    if (assets[n].standard === 20) {
      m.push({arn: n, asset: assets[n]});
    }

    return m;
  }, []) 
}

export function useLocksmithContract(contract, addressOverride = null) {
  const network = useNetwork();
  const provider = useProvider();
  return useContract({
     address: addressOverride || Networks.getContractAddress(network.chain.id, contract), 
     abi: LocksmithInterface.getAbi(contract).abi,
     provider
  });
}

export function useAssetMetadata(arn) {
  const network = useNetwork();
  return Networks.getAsset(network.chain.id, arn);
}

export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export function useLocksmithWrite(contract, method, args, enabled, errorFunc, successFunc, addressOverride = null) {
  const account = useAccount();
  const network = useNetwork();
  const feeData = useFeeData();
  const config = Networks.getNetwork(account.isConnected ? network.chain.id : null);
  const preparation = usePrepareContractWrite({
    address: addressOverride !== null ? addressOverride : 
      (account.isConnected ? config.contracts[contract].address : ethers.constants.AddressZero),
    abi: LocksmithInterface.getAbi(contract).abi, 
    functionName: method,
    args: args,
    enabled: enabled && account.isConnected,
    onError(error) {
      console.log("There was an error prepping a contract write on: " + contract + "::" + method);
      console.log(args);
      console.log("Something really bad happened " + error);
    }
  });

  var ucw = useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
  if(preparation.config.request) {
    ucw.gasLimit = preparation.config.request.gasLimit;
  }
  if(feeData.data) {
    ucw.gasPrice = feeData.data.gasPrice;
  }
  return ucw;
}

export function useLocksmithRead(contract, method, args, enabled = true, watch = false) {
  const network = useNetwork();
  const connected = network && network.chain && network.chain.id; 
  const config = Networks.getNetwork(connected ? network.chain.id : null);    
  return useContractRead({
    address: connected ? config.contracts[contract].address : ethers.constants.AddressZero,
    abi: LocksmithInterface.getAbi(contract).abi,
    functionName: method,
    args: args,
    enabled: enabled && connected, 
    watch: watch
  });
}
