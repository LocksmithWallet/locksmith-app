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
import { useProvider } from 'wagmi';

export const TransactionHistoryButton = () => {
  const transactions = useContext(TransactionListContext);
  const disclosure = useDisclosure();

  return transactions.transactions.length > 0 && (
    <Button size='sm' boxShadow='lg' pos='relative' onClick={() => {
        disclosure.onOpen();
        transactions.clearNotificationCount();
      }}>
      { transactions.notificationCount > 0 && <Box 
        pos='absolute'
        bg='red.500'
        top='-0.8em'
        right='-0.8em'
        fontSize='0.9em'
        borderRadius='full' p='0.3em' pl='0.5em' pr='0.5em'>
        <Text textColor='white' fontWeight='bold'>{transactions.notificationCount}</Text>
      </Box> }
      <Box pos='absolute'>
        <AiOutlineHistory size='20px'/>
      </Box>
      <TransactionHistoryDrawer disclosure={disclosure}/>
    </Button>)
};

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
        <DrawerBody>
          <List>
            {transactions.transactions.map((txn) => (<ListItem key={txn.data.hash}>
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
    (async function() {
      const r = await provider.waitForTransaction(txn.data.hash);
      setReceipt(r);
    })();
  }, []);
  return (<HStack>
    { receipt === null && <Spinner/> }
    { receipt !== null && <AiFillCheckCircle size='24' color='green'/> }
    <Text fontWeight='bold'>{txn.title}</Text>
  </HStack>)
}
