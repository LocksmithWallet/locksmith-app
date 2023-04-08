import { useEffect, useState } from 'react';
import { 
  useNetwork,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

import { Networks } from '../configuration/Networks';
import { LocksmithInterface } from '../configuration/LocksmithInterface';

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
  const network = useNetwork();
  const config = Networks.getNetwork(network.chain.id);
  const preparation = usePrepareContractWrite({
    address: config.contracts[contract].address, 
    abi: LocksmithInterface.getAbi(contract).abi, 
    functionName: method,
    args: args,
    enabled: enabled,
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
