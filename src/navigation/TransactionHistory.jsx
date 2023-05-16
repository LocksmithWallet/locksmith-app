import { 
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  List,
  ListItem,
  HStack,
  Text,
  Spacer,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  useEffect,
  useContext,
  useRef,
  useState
} from 'react';
import { AiOutlineHistory, AiFillCheckCircle } from 'react-icons/ai';
import { TransactionListContext } from '../components/TransactionProvider';
import { motion } from 'framer-motion';
import { useProvider } from 'wagmi';

import { TransactionExplorerButton } from '../components/Address';

export const TransactionHistoryButton = () => {
  const transactions = useContext(TransactionListContext);
  const disclosure = useDisclosure();

  return transactions.transactions.length > 0 && (
    <Button size='sm' boxShadow='lg' pos='relative' onClick={() => {
        disclosure.onOpen();
        transactions.clearUnviewedTransactions();
      }}>
      { transactions.unviewedTransactions.length > 0 && <Box 
        pos='absolute'
        bg='red.500'
        top='-0.8em'
        right='-0.8em'
        fontSize='0.9em'
        borderRadius='full' p='0.3em' pl='0.5em' pr='0.5em'>
        <Text textColor='white' fontWeight='bold'>{transactions.unviewedTransactions.length}</Text>
      </Box> }
      <Box pos='absolute'>
        <AiOutlineHistory size='20px'/>
      </Box>
      <TransactionHistoryDrawer disclosure={disclosure}/>
      { transactions.transactions.map((t) => <TransactionWatcher 
        key={'watcher'+t.data.hash}
        txn={t} />) }
    </Button>)
};

export const TransactionWatcher = ({txn, ...rest}) => {
  const provider = useProvider();
  const transactions = useContext(TransactionListContext);

  useEffect(() => {
    setTimeout(() => { (async function() {
      const receipt = provider.waitForTransaction(txn.data.hash);

      // add the hash to unviewed transactions 
      transactions.addUnviewedTransaction(txn.data.hash);
    })(); }, 10000);
  }, []);

  return '';
}

export const TransactionHistoryDrawer = ({disclosure}) => {
  const transactions = useContext(TransactionListContext);
  const btnRef = useRef();

  return (<Drawer
    isOpen={disclosure.isOpen}
    placement='right'
    onClose={disclosure.onClose}
    finalFocusRef={btnRef}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton size='lg'/>
        <DrawerHeader>Transaction History</DrawerHeader>
        <DrawerBody p='0em'>
          <List spacing='0.5em'>
            {transactions.transactions.map((txn, i) => (<ListItem key={txn.data.hash}
              p='1em'
              bg={i%2!==0?'gray.50':'white'}>
              <TransactionHistoryEntry txn={txn}/>
            </ListItem> ))} 
          </List>
        </DrawerBody>
        <DrawerFooter>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>) 
}

export const TransactionHistoryEntry = ({txn, ...rest}) => {
  const provider = useProvider();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setTimeout(() => { (async function() {
      const r = await provider.waitForTransaction(txn.data.hash);
      setReceipt(r);
    })(); }, 5000);
  }, []);
  return (<HStack { ...rest}>
    { receipt === null && <Spinner/> }
    { receipt !== null && <AiFillCheckCircle size='28' color='green'/> }
    <Text fontWeight='bold'>{txn.title}</Text>
    <TransactionExplorerButton hash={txn.data.hash} size='16px'/>
    <Spacer/>
    { receipt && <motion.div
      initial={{opacity: 0, x: 200}}
      animate={{opacity: 1, x: 0}}>
        <Button size='sm' boxShadow='md'>Details</Button>
    </motion.div> }
  </HStack>)
}
