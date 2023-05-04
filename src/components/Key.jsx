import { motion } from 'framer-motion';
import { useNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { useInspectKey } from '../hooks/contracts/Locksmith';
import { DisplayAddress } from './Address';
import { useToast } from '@chakra-ui/react';
import { 
  FiCopy,
  FiExternalLink
} from 'react-icons/fi';

export const KeySelectOption = ({keyId, ...rest}) => {
  const keyInfo = useInspectKey(keyId);

  return keyInfo && (
    <option value={keyId}>{keyId.toString()}: {keyInfo.alias}</option>
  )
}

export const AddressExplorerButton = ({address, ...rest}) => {
  const network = useNetwork();
  const url = Networks.getNetwork(network.chain.id).getAddressExplorerUrl(address);
  return ( address &&
    <motion.a
      initial={{opacity: 0, color: '#808080'}}
      animate={{opacity: 1}}
      whileHover={{scale: 1.3, color: '#FFD700'}} 
      whileTap={{scale: 0.9}} 
      href={url}
      target='_blank'>
      <FiExternalLink size='24px'/>
    </motion.a>
  )
}

export const CopyButton = ({content, ...rest}) => {
  const network = useNetwork();
  const toast = useToast();

  return ( content &&
    <motion.a
      initial={{opacity: 0, color: '#808080'}}
      animate={{opacity: 1}}
      whileHover={{scale: 1.3, color: '#FFD700'}}
      whileTap={{scale: 0.9}}
      onClick={() => { 
        navigator.clipboard.writeText(content); 
        toast({
          description: "Copied to Clipboard.",
          position: 'top',
          duration: 1000,
          isClosable: false,
        })
      }}
      style={{cursor: 'pointer'}}>
      <FiCopy size='24px'/>
    </motion.a>
  )
}

// takes the keyInfo object from useInspectKey, size is in 'XYpx'.
export const KeyIcon = ({keyInfo, size = null, ...rest}) => {
  return (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height={size || '20px'}  width={size || '20px'} xmlns="http://www.w3.org/2000/svg" {... rest}>
    <g fill={keyInfo.isRoot ? "#FFA000" : '#a0a0a0'}>
      <polygon points="30,41 26,45 22,45 18,41 18,21 30,21 30,29 28,31 30,33 30,35 28,37 30,39"></polygon>
      <path d="M38,7.8C37.5,6,36,4.7,34.3,4.2C31.9,3.7,28.2,3,24,3s-7.9,0.7-10.3,1.2C12,4.7,10.5,6,10,7.8 c-0.5,1.7-1,4.1-1,6.7c0,2.6,0.5,5,1,6.7c0.5,1.8,1.9,3.1,3.7,3.5C16.1,25.3,19.8,26,24,26s7.9-0.7,10.3-1.2 c1.8-0.4,3.2-1.8,3.7-3.5c0.5-1.7,1-4.1,1-6.7C39,11.9,38.5,9.5,38,7.8z M29,13H19c-1.1,0-2-0.9-2-2V9c0-0.6,3.1-1,7-1s7,0.4,7,1v2 C31,12.1,30.1,13,29,13z"></path>
    </g>
    <rect x="23" y="26" fill={keyInfo.isRoot ? "#D68600" : '#71706e'} width="2" height="19"></rect>
  </svg>)
}
