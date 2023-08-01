//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  React, 
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  List,
  ListItem,
  Text,
  Spacer,
  Spinner,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';

import { ethers } from 'ethers';
import {
  useAccount,
  useProvider,
  useNetwork,
} from 'wagmi';
import { Networks } from './configuration/Networks';
import { LocksmithInterface } from './configuration/LocksmithInterface';
import {
  TransactionListContext
} from './components/TransactionProvider';

import {
  useAssetMetadata
} from './hooks/Utils';
import {
  useKeyHolders,
  useKeyBalance,
} from './hooks/contracts/KeyVault';
import {
  useTrustInfo,
  useInspectKey,
} from './hooks/contracts/Locksmith';
import {
  useKeyInboxAddress
} from './hooks/contracts/PostOffice';
import {
  useRecoveryPolicy
} from './hooks/contracts/TrustRecoveryCenter';

import {
  DisplayAddress,
  AddressAvatar,
} from './components/Address';
import { AddressExplorerButton, CopyButton } from './components/Key';
import { ContextBalanceUSD } from './components/Ledger';
import { KeyIcon } from './components/Key';
import { OnlyOnChains } from './components/SupportedNetworkCheck';

import { 
  motion,
  AnimatePresence,
  LayoutGroup,
  useAnimation,
} from 'framer-motion';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdHealthAndSafety } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export const ConfigureRecoveryAlertIngress = ({keyInfo, ...rest}) => {
  const policy = useRecoveryPolicy(keyInfo.keyId);
  const navigate = useNavigate();
  return (policy && !policy.isValid) && (
    <Alert status='info'>
      <MdHealthAndSafety size='40px' color='#3186CE' style={{filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))'}}/>
      <HStack width='100%' ml='0.5em'>
        <Text fontStyle='italic'>Enable recovery.</Text>
        <Spacer/>
        <Button size='sm' colorScheme='blue'
          onClick={() => { navigate('/trust/' + keyInfo.trustId); }}>Set Up</Button>
      </HStack>
    </Alert>
  )
}

export const RecoveryStatusBox = ({keyId, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  const ref = useRef(null);  
  const policy = useRecoveryPolicy(keyId);

  return (<motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.35}}>
    <Box ref={ref} mt='2em' 
      overflow='hidden' pos='relative'
      bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' height='100%' style={{marginLeft: '1em', marginRight: '1em'}}>
      <HStack>
        <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}} style={{position: 'relative'}}>
          <MdHealthAndSafety size='80px' color='#3186CE' style={{position: 'absolute', top: '-38px', left: '-22px', opacity: 0.6}}/>
        </motion.div>
        <Text fontWeight='bold' pl='3em'>Recovery</Text>
        <Spacer/>
        { policy && !policy.isValid && (
          <Button size='sm' colorScheme='blue'>Enable</Button>
        ) }
      </HStack>
    </Box>
  </motion.div>)
}

export function Recovery() {
  const { keyId } = useParams();

  return '';
}

