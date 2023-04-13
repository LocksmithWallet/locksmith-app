import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractRead,
  useContractWrite
} from 'wagmi';
import { Networks } from '../configuration/Networks';
import { LocksmithInterface } from '../configuration/LocksmithInterface';

export function getReceiptEvents(receipt, contract, eventName) {
  // grab the event definition from the ABI
  const definition = LocksmithInterface.getEventDefinition(contract, eventName);

  // translate this into the ethers topic signature
  const eventTopics = definition.inputs.map((i) => i.internalType);
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

export function useLocksmithWrite(contract, method, args, enabled, errorFunc, successFunc) {
  const account = useAccount();
  const network = useNetwork();
  const config = Networks.getNetwork(account.isConnected ? network.chain.id : null);
  const preparation = usePrepareContractWrite({
    address: account.isConnected ? config.contracts[contract].address : ethers.constants.AddressZero,
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

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
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