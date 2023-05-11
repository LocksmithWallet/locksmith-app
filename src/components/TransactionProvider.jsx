import { 
  createContext,
  useCallback,
  useState,
} from 'react';

export const TransactionListContext = createContext({});

export const TransactionContext = ({children}) => {
  const [transactions, setTransactions] = useState([]);
  return (<TransactionListContext.Provider value={{
    transactions: transactions,
    actions: {
      addTransaction: useCallback((txn) =>{
        setTransactions([... transactions, txn]);
      })
    }
  }}>{children}</TransactionListContext.Provider>)
}
