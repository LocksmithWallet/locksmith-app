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
  Tag,
  TagLabel,
  TagLeftIcon,
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
import { AiOutlineNumber } from 'react-icons/ai';

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
          onClick={() => { navigate('/trust/' + keyInfo.trustId + "/recovery"); }}>Set Up</Button>
      </HStack>
    </Alert>
  )
}

export const RecoveryStatusBox = ({keyId, autoOpen, ...rest}) => {
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

  // enable auto-open
  useEffect(() => {
    if (autoOpen) {
      setTimeout(() => {
        toggleDetail();
      }, 1000);
    }
  }, []);

  return (<motion.div key={'jiggle-recovery-'+keyId} animate={animation} variants={boxVariants}
    {... (detailDisclosure.isOpen ? swipeProps : {})}>
    <Box ref={ref}
      overflow='hidden' pos='relative'
      style={{height: '100%', zIndex: 0, cursor: detailDisclosure.isOpen ? null : 'pointer'}}
      bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'
      onClick={() => { if(!detailDisclosure.isOpen) { toggleDetail(); } }}>
      <HStack>
        <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}} style={{position: 'relative'}}>
          <MdHealthAndSafety size={detailDisclosure.isOpen ? '50px' : '80px'} color='#3186CE' style={{
            position: 'absolute', 
            top: detailDisclosure.isOpen ?  '-24px' : '-38px', 
            left: detailDisclosure.isOpen ? '-8px' : '-22px', 
            opacity: detailDisclosure.isOpen ? 1 : 0.6
          }}/>
        </motion.div>
        <Text fontWeight='bold' pl='3em'>Recovery</Text>
        <Spacer/>
        { policy && !policy.isValid && !detailDisclosure.isOpen && (
          <Text fontStyle='italic' color='gray'>Disabled</Text> 
        ) }
        { detailDisclosure.isOpen && isDesktop &&
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/> }
      </HStack>
      { !detailDisclosure.isOpen ? '' : <RecoveryCreateWizard keyId={keyId}/> }
    </Box>
    </motion.div>)
}

export function RecoveryCreateWizard({keyId, ...rest}) {
  const [step, setStep] = useState(0);
  const animations = {
    initial: {x: '100vw'},
    animate: {x: '0', transition: {delay: 0.25}},
    exit: {x: '-100vw'},
    transition: {duration: 0.2}
  };

  // transaction parameters
  const [guardians, setGuardians] = useState([]);
  const [deadmen, setDeadmen] = useState([]);
  const [oracles, setOracles] = useState([]);

  return (
    <VStack mt='4em' spacing='0'>
      <Box width='20em'>
        <AnimatePresence>
          { step === 0 && <motion.div key='add-recovery-0' {... animations}>
            <StepZeroContent keyId={keyId} setStep={setStep}/>
          </motion.div> }
          { step === 1 && <motion.div key='add-recovery-1' {... animations}>
            <StepOneContent keyId={keyId} setStep={setStep}
              guardians={guardians} setGuardians={setGuardians}/>
          </motion.div> }
        </AnimatePresence>
      </Box>
    </VStack>
  )
}

export function StepZeroContent({keyId, setStep, ...rest}) {
  return (
    <VStack spacing='2em'>
      <Text fontSize='lg' align='center'>Recover your <b>Master Key</b> easily.</Text>
      <HStack width='100%'>
        <Tag size='lg'><TagLabel>1</TagLabel></Tag>
        <VStack align='stretch' spacing='0em'>
          <Text fontWeight='bold'>Choose Guardians</Text>
          <Text fontSize='sm' color='gray'>Enable Master Key recovery.</Text>
        </VStack>
      </HStack>
      <HStack width='100%'>
        <Tag size='lg'><TagLabel>2</TagLabel></Tag>
        <VStack align='stretch' spacing='0em'>
          <Text fontWeight='bold'>Select Conditions</Text>
          <Text fontSize='sm' color='gray'>Inactivity, signatures, etc.</Text>
        </VStack>
      </HStack>
      <Alert fontSize='sm' status='info'><AlertIcon/>Never share your seed phrase.</Alert>
      <Button width='100%' colorScheme='blue' onClick={() => {setStep(1);}}>Start</Button>
    </VStack>
  )
}

export function StepOneContent({keyId, setStep, guardians, setGuardians, ...rest}) {
  const [guardian, setGuardian] = useState(null); 
  const isValidAddress = ethers.utils.isAddress(guardian);

  return <VStack spacing='2em'>
    <HStack width='100%'>
      <Tag size='lg'><TagLabel>1</TagLabel></Tag>
      <Text fontWeight='bold'>Choose Guardians</Text>
    </HStack>
    <Text align='center'>You decide when <i>these</i> addresses can recover your master key.</Text>
    <Box width='100%'>
      <Input fontSize='xs' width='100%' size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        onChange={(event) => {setGuardian(event.target.value);}}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && isValidAddress) {
            // add it if its valid
          }
        }}/>
      { isValidAddress && <Text align='center' fontWeight='bold' textColor='green.600' fontSize='sm'><DisplayAddress address={guardian || ''}/></Text> }
      { !isValidAddress && <Text align='center' textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid address</Text> }
    </Box>
    <Button width='100%' onClick={()=>{setStep(0);}}>Back</Button>
    <Button width='100%' isDisabled={guardians.length < 1} colorScheme='blue' onClick={()=>{setStep(2);}}>Next</Button>
  </VStack>
}

export function Recovery() {
  const { keyId } = useParams();

  return '';
}

