import { 
  Box,
  Button,
  Text,
} from '@chakra-ui/react';
import { useContext } from 'react';
import { AiOutlineBell } from 'react-icons/ai';
import { TransactionListContext } from '../components/TransactionProvider';

export const TransactionHistoryButton = () => {
  const transactions = useContext(TransactionListContext);

  return transactions.transactions.length > 0 && (<Button size='sm' boxShadow='lg' pos='relative'>
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
  </Button>)
};
