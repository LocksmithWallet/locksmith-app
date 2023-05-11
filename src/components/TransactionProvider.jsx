import { 
  createContext,
  useCallback,
  useState,
} from 'react';

export const TransactionListContext = createContext({});

export const TransactionContext = ({children}) => {
  const [transactions, setTransactions] = useState([]);
  
  console.log(transactions);
  return (<TransactionListContext.Provider value={{
    transactions: transactions,
    addTransaction: useCallback((txn) =>{
      setTransactions([... transactions, txn]);
    })
  }}>{children}</TransactionListContext.Provider>)
}
