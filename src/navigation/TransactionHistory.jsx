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
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useContext, useRef } from 'react';
import { AiOutlineBell } from 'react-icons/ai';
import { TransactionListContext } from '../components/TransactionProvider';

export const TransactionHistoryButton = () => {
  const transactions = useContext(TransactionListContext);
  const disclosure = useDisclosure();

  return transactions.transactions.length > 0 && (
    <Button size='sm' boxShadow='lg' pos='relative' onClick={disclosure.onOpen}>
      <Box 
        pos='absolute'
        bg='red.500'
        top='-0.5em'
        right='-0.5em'
        fontSize='0.9em'
        borderRadius='full' p='0.3em' pl='0.5em' pr='0.5em'>
        <Text textColor='white' fontWeight='bold'>{transactions.notificationCount}</Text>
      </Box>
      <Box pos='absolute'>
        <AiOutlineBell size='20px'/>
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
            {transactions.transactions.map((txn) => (
              <TransactionHistoryEntry txn={txn}/>
            ))} 
          </List>
        </DrawerBody>
        <DrawerFooter>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>) 
}

export const TransactionHistoryEntry = ({txn, ...rest}) => {
  return <Text>{txn.hash}</Text>
}
