import {
  Button,
  Text,
  useToast
} from '@chakra-ui/react';
import { useAccount, useNetwork, useProvider } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { motion } from 'framer-motion';

import { Image } from '@davatar/react';
import { FiExternalLink } from 'react-icons/fi';

export function DisplayAddress({address, ...rest}) {
  return address.substring(0,6) + '...' + address.substring(address.length - 4)
}

export function AddressAlias({address, ...rest}) {
  // we can determine if its a contract we know about
  const network = useNetwork();
  const contractAlias = Networks.getContractAlias(network.chain.id, address);

  // we can also determine if its the connected account
  const account = useAccount();
  
  return account.address === address ? "(you)" : 
    (contractAlias || <DisplayAddress address={address}/>);
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

export function AddressAvatar({address, size, ...rest}) {
  const provider = useProvider();

  return <Image
    size={size||24}
    address={address}
    generatedAvatarType='jazzicon'
  />
}
