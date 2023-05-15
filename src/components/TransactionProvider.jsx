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
  const [transactionLogs, setTransactionLogs] = useState({});
  const [notifyViewNonce, setNotifyViewNonce] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // when the network changes, we need to blow away all of the state
  useEffect(() => {
    setTransactions([]);
    setTransactionLogs({});
    setNotifyViewNonce(0);
    setNotificationCount(0);
  }, [network.chain.id]);

  return (<TransactionListContext.Provider value={{
    transactions: transactions,
    notificationCount: notificationCount,
    clearNotificationCount: useCallback(() => {
      setNotificationCount(0);
      setNotifyViewNonce(notifyViewNonce+1);
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

      // we want to make sure to re-add the notification count
      // if the history is looked at between when the transaction
      // is created and when it is mined into a block.
      const myViewNonce = notifyViewNonce;

      // increment the notification count
      setNotificationCount(notificationCount+1);

      // now actually wait on that transaction
    
      // run the async process here
    })
  }}>{children}</TransactionListContext.Provider>)
}
