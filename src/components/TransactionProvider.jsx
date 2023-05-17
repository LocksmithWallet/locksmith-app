import { 
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useToast
} from '@chakra-ui/react';
import {
  useProvider,
  useNetwork,
} from 'wagmi';

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
  }, [network.chain ? network.chain.id : network]);

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
