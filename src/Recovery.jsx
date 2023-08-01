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
    <Alert status='info' mb='1em'>
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
  // jiggler
  const ref = useRef(null);  
  const isDesktop = useBreakpointValue({base: false, md: true});
  const detailDisclosure = useDisclosure();
  const animation = useAnimation();

  // data hooks
  const policy = useRecoveryPolicy(keyId);

  const boxVariants = {
    start: {
    },
    click: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        position: 'fixed',
        width: rect.width,
        height: rect.height,
        zIndex: 101,
      };
    },
    open: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        y: -1 * (rect.y) - window.scrollY,
        zIndex: 500,
        minWidth: isDesktop ? '0' : '92vw',
        marginTop: '3vh',
        height: '95vh',
      }
    },
    close: {
      x: 0,
      y: 0,
      zIndex: 0,
      position: null,
      height: null,
      marginTop: '0vh',
    },
    final: {
      width: null,
    }
  };

  const toggleDetail = function() {
    if (!detailDisclosure.isOpen) {
      detailDisclosure.onOpen();
      setTimeout(() => {
        animation.set('click');
        animation.start('open');
      }, 1);
    } else {
      detailDisclosure.onClose();
      setTimeout(async () => {
        await animation.start('close');
        animation.set('final');
      }, 1);
    }
  };

  const swipeProps = useBreakpointValue({base: {
    drag: 'y',
    onDragEnd: function(event, info) {
      if (Math.abs(info.offset.y) >= 10 ) {
        toggleDetail();
      }
    }
  }, md: {}});

  return (<motion.div key={'jiggle-recovery-'+keyId} animate={animation} variants={boxVariants}
    {... (detailDisclosure.isOpen ? swipeProps : {})}>
    <Box ref={ref}
      overflow='hidden' pos='relative'
      style={{height: '100%', zIndex: 0, cursor: detailDisclosure.isOpen ? null : 'pointer'}}
      bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'
      onClick={() => { if(!detailDisclosure.isOpen) { toggleDetail(); } }}>
      <HStack>
        <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}} style={{position: 'relative'}}>
          <MdHealthAndSafety size='80px' color='#3186CE' style={{position: 'absolute', top: '-38px', left: '-22px', opacity: 0.6}}/>
        </motion.div>
        <Text fontWeight='bold' pl='3em'>Recovery</Text>
        <Spacer/>
        { policy && !policy.isValid && (
          <Text fontStyle='italic' color='gray'>Disabled</Text> 
        ) }
      </HStack>
    </Box>
    </motion.div>)
}

export function Recovery() {
  const { keyId } = useParams();

  return '';
}

