import { 
  Box,
  Button,
  Collapse,
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
  VStack,
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
import {
  motion,
  AnimatePresence,
  LayoutGroup
} from 'framer-motion';
import { useProvider } from 'wagmi';
import { getLocksmithEvents } from '../hooks/Utils';
import { TransactionExplorerButton } from '../components/Address';
import * as transactionEvents from '../components/TransactionEvents';

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
    (async function() {
      const receipt = provider.waitForTransaction(txn.data.hash);

      // add the hash to unviewed transactions 
      transactions.addUnviewedTransaction(txn.data.hash);
    })();
  }, []);

  return '';
}

export const TransactionHistoryDrawer = ({disclosure}) => {
  const transactions = useContext(TransactionListContext);
  const [selectedHash, setSelectedHash] = useState(null);
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
            <LayoutGroup>
              <AnimatePresence>
                { transactions.transactions.map((txn, i) => (selectedHash === null || txn.data.hash === selectedHash) && (
                  <motion.div key={'animate-'+txn.data.hash} layout
                      style={{position: 'relative'}}
                      initial={{opacity: 0, x: 300}}
                      animate={{opacity: 1, x: 0}}
                      exit={{opacity: 0, x: 200}}>
                    <ListItem key={txn.data.hash} p='1em' bg={i%2!==0?'gray.50':'white'}>
                      <TransactionHistoryEntry txn={txn} selectedHash={selectedHash} selectHash={setSelectedHash}/>
                    </ListItem>
                  </motion.div>))}
              </AnimatePresence>
            </LayoutGroup>
          </List>
        </DrawerBody>
        <DrawerFooter>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>) 
}

export const TransactionHistoryEntry = ({txn, selectedHash, selectHash, ...rest}) => {
  const provider = useProvider();
  const transactions = useContext(TransactionListContext);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    (async function() {
      const r = await provider.waitForTransaction(txn.data.hash);
      transactions.removeUnviewedTransaction(txn.data.hash);
      setReceipt(r);
    })();
  }, []);

  return (<VStack align='stretch' {...rest}>
    <HStack>
      { receipt === null && <Spinner/> }
      { receipt !== null && <AiFillCheckCircle size='28' color='green'/> }
      <Text fontWeight='bold'>{txn.title}</Text>
      <TransactionExplorerButton hash={txn.data.hash} size='16px'/>
      <Spacer/>
      { receipt && <motion.div
        initial={{opacity: 0, x: 200}}
        animate={{opacity: 1, x: 0}}>
        <Button size='sm' boxShadow='md' onClick={() => {
          selectHash(txn.data.hash === selectedHash ? null : txn.data.hash);
        }}>{txn.data.hash === selectedHash ? 'Back' : 'Details'}</Button>
      </motion.div> }
    </HStack>
    <Collapse in={(selectedHash === txn.data.hash) && (receipt !== null)}>
      <TransactionEventDetail receipt={receipt}/>
    </Collapse>
  </VStack>)
}

export const TransactionEventDetail = ({receipt, ...rest}) => {
  const events = getLocksmithEvents(receipt);
  console.log(events);
  
  return (<List spacing='1em'>
    { events.map((e) => {
      const EventType = transactionEvents[e.name.charAt(0).toUpperCase() + e.name.slice(1) + "Event"] 
        || transactionEvents['DefaultTransactionEvent'];
      return (<ListItem>
        <EventType event={e}/>
      </ListItem>)
    }) }
  </List>)
};
