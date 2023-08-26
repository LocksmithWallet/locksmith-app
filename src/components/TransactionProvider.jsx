import { 
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useToast,
  Skeleton,
  HStack,
  Text,
  Spacer,
} from '@chakra-ui/react';
import {
  useProvider,
  useNetwork,
} from 'wagmi';
import { ethers } from 'ethers';
import { GAS_ARN } from '../configuration/AssetResource';
import { Networks } from '../configuration/Networks';

import { useNetworkGasTokenPrice, USDFormatter } from '../hooks/Prices';

export const TransactionListContext = createContext({});

export const TransactionContext = ({children}) => {
  const provider = useProvider();
  const network = useNetwork();
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [unviewedTransactions, setUnviewedTransactions] = useState([]);
  const [transactionLogs, setTransactionLogs] = useState({});
  
  // when the network changes, we need to blow away all of the state
  useEffect(() => {
    setTransactions([]);
    setTransactionLogs({});
  }, [network.chain ? network.chain.id : null]);

  return (<TransactionListContext.Provider value={{
    transactions: transactions,
    unviewedTransactions: unviewedTransactions,
    clearUnviewedTransactions: useCallback(() => {
      setUnviewedTransactions([]);
    }),
    addUnviewedTransaction: useCallback((hash) => {
      setUnviewedTransactions([hash, ...unviewedTransactions]);
    }),
    removeUnviewedTransaction: useCallback((hash) => {
      setUnviewedTransactions(unviewedTransactions.filter((t) => t.data.hash !== hash));
    }),
    addTransaction: useCallback((txn) =>{
      // keep a history of each hash
      setTransactions([txn, ...transactions]);

      // acknowledge that we have it now
      toast({
        description: 'Transaction Submitted',
        status: 'info',
        duration: 2000,
        isClosable: false,
        position: 'top',
      });
    })
  }}>{children}</TransactionListContext.Provider>)
}

export const TransactionEstimate = ({promise, ...rest}) => {
  const network = useNetwork();
  const gasAssetPrice = useNetworkGasTokenPrice();
  const totalGas = (promise.gasPrice && promise.gasLimit) ? ethers.utils.formatEther(promise.gasPrice.mul(promise.gasLimit)) : 0;
  const costUsd = USDFormatter.format((promise.gasPrice && promise.gasLimit && gasAssetPrice.data) ?
    gasAssetPrice.data * totalGas : 0);

  return (
     <HStack width='100%'>
      <Text>Estimate:</Text>
      <Spacer/>
      <Skeleton isLoaded={promise.gasPrice && promise.gasLimit && gasAssetPrice.data}>
        <Text>{costUsd} (~{parseFloat(totalGas).toFixed(5)} {Networks.getAsset(network.chain.id, GAS_ARN).symbol})</Text>
      </Skeleton>
    </HStack>)
}
