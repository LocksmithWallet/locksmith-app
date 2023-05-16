import {
  Button,
  useToast
} from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import { motion } from 'framer-motion';
import { Networks } from '../configuration/Networks';

import { FiExternalLink } from 'react-icons/fi';

export function DisplayAddress({address, ...rest}) {
  return address.substring(0,6) + '...' + address.substring(address.length - 4)
}

export function CopyButton({label, thing, ...rest}) {
  const toast = useToast();
  return <Button variant='ghost' size='sm' borderRadius='full' onClick={() => {
    navigator.clipboard.writeText(thing);
    toast({
      title: 'Copied to clipboard',
      description: thing,
      status: 'info',
      duration: 2000,
      isClosable: false
    });
  }}>{label}</Button>
}

export const TransactionExplorerButton = ({hash, ...rest}) => {
  const network = useNetwork();
  const url = Networks.getNetwork(network.chain.id).getTransactionExplorerUrl(hash);
  return ( hash &&
    <motion.a
      initial={{opacity: 0, color: '#808080'}}
      animate={{opacity: 1}}
      whileHover={{scale: 1.3, color: '#FFD700'}}
      whileTap={{scale: 0.9}}
      href={url}
      target='_blank'>
      <FiExternalLink size='24px' {... rest}/>
    </motion.a>
  )
}
