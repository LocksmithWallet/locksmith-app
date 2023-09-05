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
  Skeleton,
  Select,
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
  TransactionListContext,
  TransactionEstimate,
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
  useTrustedActors,
} from './hooks/contracts/Notary';
import {
  useKeyInboxAddress
} from './hooks/contracts/PostOffice';
import {
  useRecoveryPolicy,
  useChangeGuardians,
} from './hooks/contracts/TrustRecoveryCenter';
import {
  useRecoveryPolicyCreator
} from './hooks/contracts/RecoveryPolicyCreator';
import {
  useEventInfo
} from './hooks/contracts/TrustEventLog';
import {
  useAlarmClock
} from './hooks/contracts/AlarmClock';

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
import { MdHealthAndSafety, MdOutlineHourglassTop } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FcAlarmClock } from 'react-icons/fc';
import { ImCheckmark } from 'react-icons/im';
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

export const RecoveryStatusBox = ({keyId, trustInfo, autoOpen, ...rest}) => {
  // jiggler
  const ref = useRef(null);  
  const isDesktop = useBreakpointValue({base: false, md: true});
  const detailDisclosure = useDisclosure();
  const animation = useAnimation();
  const network = useNetwork()

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
        { policy && policy.isValid && !detailDisclosure.isOpen && (
          <RecoveryStatusPreview keyId={keyId} trusInfo={trustInfo} policy={policy} />
        ) }
        { detailDisclosure.isOpen && isDesktop &&
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/> }
      </HStack>
      { !detailDisclosure.isOpen ? '' : (
        policy && policy.isValid ? <RecoveryManagementWizard keyId={keyId} trustInfo={trustInfo} policy={policy} toggleDetail={toggleDetail}/> :
          <RecoveryCreateWizard keyId={keyId} trustInfo={trustInfo} toggleDetail={toggleDetail}/> ) } 
    </Box>
    </motion.div>)
}

export function RecoveryStatusPreview({keyId, trustInfo, policy, ...rest}) {
  // Note: This will break if and when recovery policy UI has more than
  //       a single event configuraiton. We are going to assume the first
  //       event hash is a deadman configuration, and there aren't any others.
  const eventInfo = useEventInfo(policy.events[0]);
  const alarmInfo = useAlarmClock(policy.events[0]);

  return eventInfo && alarmInfo && (<>
    { eventInfo.fired && <Text fontColor='red'>Awaiting Recovery</Text> }
    { !eventInfo.fired && <Text>{(new Date(alarmInfo.alarmTime*1000)).toDateString()}</Text> }
  </>)
}

export function RecoveryManagementWizard({keyId, trustInfo, policy, toggleDetail, ...rest}) {
  // assume its an alarm clock, which will break later
  const eventInfo = useEventInfo(policy.events[0]);
  const alarmInfo = useAlarmClock(policy.events[0]);
  
  return <VStack mt='2em' spacing='2em'>
    <VStack spacing='1em'>
      <HStack>
        <FcAlarmClock size='50'/>
        <VStack spacing='0' align='stretch'>
          <Text fontWeight='bold'>{eventInfo ? eventInfo.description: '...'}</Text>
          <Skeleton isLoaded={alarmInfo}>
            { alarmInfo && <Text size='sm'>{(new Date(alarmInfo.alarmTime*1000)).toDateString()}</Text> }
          </Skeleton>
        </VStack>
      </HStack>
      { alarmInfo && !alarmInfo.tooEarly && 
        <Button colorScheme='green' size='sm' leftIcon={<ImCheckmark size='20'/>} width='16em'>Check In</Button>
      }
      { alarmInfo && alarmInfo.tooEarly && 
        <Button colorScheme='gray' isDisabled={true} size='sm' leftIcon={<MdOutlineHourglassTop size='20'/>} width='16em'>Checked In</Button>
      }
    </VStack>
    <VStack width='20em' spacing='1em'>
      <Text width='100%' align='left' fontWeight='bold'>Recovery Addresses ({policy.guardians.length}):</Text>
      <RecoveryAddressManager keyId={keyId} trustInfo={trustInfo} policy={policy} toggleDetail={toggleDetail}/>
    </VStack>
  </VStack>
}

export function RecoveryAddressManager({keyId, trustInfo, policy, toggleDetail, ...rest}) {
  const account = useAccount();
  const [action, setAction] = useState(null); // true for adding, false for removing
  const [guardianActionList, setGuardianActionList] = useState([]);

  const buttonAnimation = {
    initial: {
      y: 100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {delay: 0.25, duration: 0.2}
    },
    exit: {
      y: 100, 
      opacity: 0,
      transition: {duration: 0.1}
    }
  };

  // exit remove mode if the list gets empty after a change
  useEffect(() => {
    if(guardianActionList.length === 0 && action === false) {
      setAction(null);
    }
  }, [guardianActionList]);

  return (<VStack width='100%' spacing='1em'>
    <List width='100%' spacing='0.75em'>
    <AnimatePresence>
      { policy.guardians.map((r) => (<ListItem key={'ramra'+r} as={motion.div} exit={{x: '-50vw', opacity: 0, transition: {duration: 0.2}}}>
        <HStack width='100%'>
          <Box pos='relative'>
            { account.address === r && <Spinner
                pos='absolute'
                thickness='2px'
                top='-16px'
                left='4px'
                speed='2s'
                color='blue.500'
                size='lg'/> }
           </Box>
           <AddressAvatar address={r}/>
           <HStack><Text><DisplayAddress address={r}/></Text><CopyButton content={r} size='20'/></HStack>
           <Spacer/>
          { !action && !guardianActionList.includes(r) && <IconButton size='sm' icon={<FiTrash2 size='22px' color='#ff7b47'/>} borderRadius='full' boxShadow='md'
            onClick={() => {setAction(false); setGuardianActionList((prev) => [... prev, r]);}}/> }
          { action === false && guardianActionList.includes(r) && <Button 
              size='sm' fontStyle='italic' color='gray.600'
              onClick={() => {setGuardianActionList((prev) => prev.filter((g) => g !== r));}}>Undo</Button> }
         </HStack>
       </ListItem>)) }
     </AnimatePresence>
    </List>
    <AnimatePresence>
      { !action && action !== false && <motion.div key='add-guardian-button' {... buttonAnimation}>
          <Button colorScheme='blue' width='20em' exit={{x: '-100vw', opacity: 0}}>Add Address</Button>
      </motion.div> }
    </AnimatePresence>
    <AnimatePresence>
      { action === false && <motion.div key='remove-guardian-button' {... buttonAnimation}>
        <RemoveGuardiansConfirmationButton 
          trustInfo={trustInfo}
          policy={policy}
          guardianActionList={guardianActionList}
          callback={() => {setGuardianActionList([]);}}/>
      </motion.div> }
    </AnimatePresence>
  </VStack>)
}

export function RemoveGuardiansConfirmationButton({trustInfo, policy, guardianActionList, callback, ...rest}) {
  const transactions = useContext(TransactionListContext);
  const changeGuardians = useChangeGuardians(trustInfo.rootKeyId, guardianActionList, 
    guardianActionList.map((g) => false), 
    (error) => {
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'REMOVE_RECOVERY_ADDRESSES',
        title: 'Change Recovery',
        subtitle: 'Removed ' + guardianActionList.length + " addresses",
        data: data
      });

      // this is going to clear the list and reset
      // the view
      callback();
    });

  return (<>
    <TransactionEstimate promise={changeGuardians}/>
    <Button colorScheme='red' width='20em'
    isDisabled={!changeGuardians.write}
    onClick={() => {changeGuardians.write?.();}}>
      Remove Addresses ({guardianActionList.length})
    </Button>
  </>)
}

export function RecoveryCreateWizard({keyId, trustInfo, toggleDetail, ...rest}) {
  const network = useNetwork();
  const [step, setStep] = useState(0);
  const animations = {
    initial: {x: '100vw'},
    animate: {x: '0', transition: {delay: 0.25}},
    exit: {x: '-100vw'},
    transition: {duration: 0.2}
  };

  // transaction parameters
  const [guardians, setGuardians] = useState([]);
  const [days, setDays] = useState(90);

  // write
  const alarmClockAddress = Networks.getContractAddress(network.chain.id, 'AlarmClock');
  const trustedDispatchers = useTrustedActors(Networks.getContractAddress(network.chain.id, 'TrustEventLog'),
    trustInfo.trustId, 2);
  const needsAlarmNotary = trustedDispatchers.isSuccess &&
    (trustedDispatchers.data.indexOf(alarmClockAddress) < 0);

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
          { step === 2 && <motion.div key='add-recovery-2' {... animations}>
            <StepTwoContent keyId={keyId} setStep={setStep}
              guardians={guardians} setGuardians={setGuardians}/> 
          </motion.div> }
          { step === 3 && <motion.div key='add-recovery-3' {... animations}>
            <StepThreeContent keyId={keyId} setStep={setStep}
              guardians={guardians} days={days} setDays={setDays}/>
          </motion.div> }
          { step === 4 && <motion.div key='add-recovery-4' {... animations}>
            <StepFourContent keyId={keyId} setStep={setStep}
              guardians={guardians} days={days} needsAlarmNotary={needsAlarmNotary} toggleDetail={toggleDetail}/>
          </motion.div> }
        </AnimatePresence>
      </Box>
    </VStack>
  )
}

export function StepZeroContent({keyId, setStep, ...rest}) {
  return (
    <VStack spacing='2em'>
      <Text fontSize='lg' align='center'>Recover your <b>Trust </b> easily.</Text>
      <HStack width='100%'>
        <Tag size='lg'><TagLabel>1</TagLabel></Tag>
        <VStack align='stretch' spacing='0em'>
          <Text fontWeight='bold'>Choose Recovery Addresses</Text>
          <Text fontSize='sm' color='gray'>Enable Trust recovery.</Text>
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

  const canAddAddress = function() {
    return isValidAddress && guardians.indexOf(guardian) < 0;
  };

  return <VStack spacing='2em'>
    <HStack width='100%'>
      <Tag size='lg'><TagLabel>1</TagLabel></Tag>
      <Text fontWeight='bold'>Choose Recovery Addresses</Text>
    </HStack>
    <Text align='center'>You decide when <i>these</i> addresses can recover your Trust.</Text>
    <Box width='100%'>
      <Input fontSize='xs' width='100%' size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        onChange={(event) => {setGuardian(event.target.value);}}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && canAddAddress()) {
            setGuardians((prev) => [prev, guardian].flat(2));
            setStep(2);
          }
        }}/>
      { isValidAddress && canAddAddress() &&
        <Text align='center' fontWeight='bold' textColor='green.600' fontSize='sm'><DisplayAddress address={guardian || ''}/></Text> }
      { isValidAddress && !canAddAddress() && 
        <Text align='center' textColor='red.600' fontStyle='italic' fontSize='sm'>Duplicate recovery address</Text> }
      { !isValidAddress && <Text align='center' textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid address</Text> }
    </Box>
    <Button width='100%' onClick={()=>{setStep(guardians.length > 0 ? 2 : 0);}}>Back</Button>
    <Button width='100%' isDisabled={!canAddAddress()} colorScheme='blue' onClick={()=>{
      // it won't be a
      setGuardians((prev) => [prev, guardian].flat(2));
      setStep(2);
    }}>Next</Button>
  </VStack>
}

export function StepTwoContent({keyId, setStep, guardians, setGuardians, ...rest}) {
  const { address } = useAccount();

  const removeGuardian = function(guardian) {
    var newGuardians = guardians.filter((g) => g !== guardian);

    // remove the guardian from the array
    setGuardians(newGuardians);

    // if we have an empty guardian set, then
    // go back to step one.
    if(newGuardians.length < 1) { setStep(1); }
  };

  return <VStack spacing='2em'>
    <Text fontWeight='bold'>Recovery Addresses ({guardians.length})</Text>
    <List spacing='1.5em' width='100%'><AnimatePresence>
      { guardians.map((g,x) => <motion.div key={'gm'+g} exit={{x: '-100vw'}}><ListItem key={'guardian-'+x}>
        <HStack pos='relative'>
          <AddressAvatar address={g} size={24}/>
          { (address === g) && <Spinner
              pos='absolute'
              top='-4px'
              left='-12px'
              thickness='2px'
              speed='2s'
              color='blue.500'
              size='lg'
            /> }
          <Text fontWeight='bold' fontSize='0.8em'><DisplayAddress address={g}/></Text>
          <Spacer/>
          <IconButton size='sm' right='0px' pos='absolute' icon={<FiTrash2 size='22px' color='#ff7b47'/>} borderRadius='full' boxShadow='md'
            onClick={() => {removeGuardian(g);}}/>
        </HStack>
      </ListItem></motion.div>) }
      </AnimatePresence>
    </List>
    <Button width='100%' onClick={() => {setStep(1);}}>Add Address</Button>
    <Button width='100%' onClick={() => {setStep(3);}} colorScheme='blue'>Next</Button> 
  </VStack>
}

export function StepThreeContent({keyId, setStep, guardians, days, setDays, ...rest}) {
  return <VStack spacing='2em'>
    <HStack width='100%'>
      <Tag size='lg'><TagLabel>2</TagLabel></Tag>
      <Text fontWeight='bold'>Choose Conditions</Text>
    </HStack>
    <VStack width='100%'>
    <HStack width='100%'>
      <FcAlarmClock size='32px'/>
      <Text fontWeight='bold'>Inactivity Alarm</Text>
    </HStack>
      <Text>Set a timespan to require check-ins from <b>Trust</b> admins.</Text>
      <Text>Missed check-ins enable one of your <b>recovery addresses</b> to recover admin rights.</Text>
    </VStack>
    <Select variant='filled' size='lg' defaultValue={days} onChange={(e) => {setDays(e.target.value);}}>
      <option value='30'>Every 30 days</option>
      <option value='90'>Every 90 days</option>
      <option value='180'>Every 6 months</option>
      <option value='365'>Once a year</option>
      <option value='730'>Once every 2 years</option>
      <option value='1825'>Once every 5 years</option>
    </Select>
    <Button width='100%' colorScheme='blue' onClick={() => {setStep(4);}}>Next</Button>
  </VStack>
}

export function StepFourContent({keyId, trustInfo, setStep, needsAlarmNotary, guardians, days, toggleDetail, ...rest}) {
  const { address } = useAccount();
  const transactions = useContext(TransactionListContext);
  const [time, setTime] = useState(Date.now() + 86400000 * days);
 
  // write
  const createPolicy = useRecoveryPolicyCreator(keyId, needsAlarmNotary, false, guardians, [
    [ethers.utils.formatBytes32String('Recovery Check-in'), Math.floor((new Date(time)).getTime() / 1000), days * 86400, keyId]
  ], [], (error) => {
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'CREATE_RECOVERY',
        title: 'Enable Recovery',
        subtitle: 'With ' + guardians.length + " addresses",
        data: data
      });
      toggleDetail();
    });

  return <VStack spacing='2em'>
    <Text fontWeight='bold'>Final Review</Text>
    <VStack width='100%' spacing='1em'>
    <HStack width='100%'>
      <Tag size='lg'><TagLabel>1</TagLabel></Tag>
      <Text fontWeight='bold'>Recovery Addresses</Text>
      <Spacer/>
      <Button borderRadius='full' onClick={() => {setStep(2);}}><FiEdit2/></Button>
    </HStack>
    <List width='100%' spacing='1.5em' pl='0.25em'>
      { guardians.map((g,x) => <ListItem key={'grli-'+g}>
        <HStack pos='relative'>
          <AddressAvatar address={g} size={24}/>
          { (address === g) && <Spinner
              pos='absolute'
              top='-4px'
              left='-12px'
              thickness='2px'
              speed='2s'
              color='blue.500'
              size='lg'
            /> }
          <Text fontWeight='bold' fontSize='0.8em'><DisplayAddress address={g}/></Text>
        </HStack>
      </ListItem> ) }
    </List></VStack>
    <VStack width='100%' spacing='1em'>
      <HStack width='100%'>
        <Tag size='lg'><TagLabel>2</TagLabel></Tag>
        <Text fontWeight='bold'>Conditions</Text>
        <Spacer/>
        <Button borderRadius='full' onClick={() => {setStep(3);}}><FiEdit2/></Button>
      </HStack>
      <HStack width='100%'>
        <FcAlarmClock size='32px'/>
        <Text fontWeight='bold' fontSize='sm'>{days} Day Alarm</Text>
      </HStack>
      <Alert status='warning' fontSize='sm'>
        <AlertIcon/>First check-in: {(new Date(time)).toDateString()}
      </Alert>
    </VStack>
    <Box width='100%'>
      <TransactionEstimate promise={createPolicy}/>
      <Button isDisabled={!createPolicy.write} isLoading={createPolicy.isLoading}
        onClick={() => { createPolicy.write?.();}} width='100%' colorScheme='blue'>Enable Recovery</Button>
    </Box>
  </VStack>
}

export function Recovery() {
  const { keyId } = useParams();

  return '';
}

