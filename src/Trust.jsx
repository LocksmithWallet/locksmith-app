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
  Tag,
  TagLabel,
  TagLeftIcon,
  Tab,
  Tabs,
  TabList,
  TabIndicator,
  TabPanels,
  TabPanel,
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
  TransactionListContext,
  TransactionEstimate,
} from './components/TransactionProvider';

import {
  useAssetMetadata
} from './hooks/Utils';
import {
  useKeyHolders,
  useKeyBalance,
  useSoulboundKeyRequirement,
} from './hooks/contracts/KeyVault';
import {
  useTrustInfo,
  useTrustKeys,
  useInspectKey,
  useCopyKey,
  useBurnKey,
} from './hooks/contracts/Locksmith';
import {
  TRUST_CONTEXT,
  KEY_CONTEXT,
  useContextBalanceSheet,
} from './hooks/contracts/Ledger';
import {
  useKeyInboxAddress
} from './hooks/contracts/PostOffice';
import {
  useMegaKeyCreator
} from './hooks/contracts/MegaKeyCreator';
import {
  USDFormatter,
  useCoinCapPrice
} from './hooks/Prices';

import {
  DisplayAddress,
  AddressAvatar,
} from './components/Address';
import { AddressExplorerButton, CopyButton } from './components/Key';
import { ContextBalanceUSD } from './components/Ledger';
import { KeyIcon } from './components/Key';
import { OnlyOnChains } from './components/SupportedNetworkCheck';
import { 
  RecoveryStatusBox 
} from './Recovery';

import { 
  motion,
  AnimatePresence,
  LayoutGroup,
  useAnimation,
} from 'framer-motion';
import { 
  AiOutlineNumber,
} from 'react-icons/ai';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FcKey, FcApproval } from 'react-icons/fc';
import { FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';

export function Trust() {
  const { trustId } = useParams();
  const trustInfo = useTrustInfo(trustId);
  const trustKeys = useTrustKeys(trustId);

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}} pos='relative'>
      { trustInfo && <TrustHeader trustId={trustId} trustInfo={trustInfo}/> }
      { trustInfo && trustKeys.isSuccess &&
        <TrustKeyList
          trustId={trustId}
          trustInfo={trustInfo}
          trustKeys={trustKeys.data}/> }
    </Box>
  </motion.div>) 
}

const TrustBalanceBox = ({trustId, ...rest}) => {
  return (<Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'>
    <VStack>
      <ContextBalanceUSD contextId={TRUST_CONTEXT} identifier={trustId}
        skeletonProps={{}}
        textProps={{
          fontSize: '2xl',
          fontWeight: 'bold'
        }}/>
    </VStack>
  </Box>)
}

const TrustHeader = ({trustId, trustInfo, ...rest}) => {
  const isDesktop = useBreakpointValue({base: false, md: true});
  const detailDisclosure = useDisclosure();
  const animation = useAnimation();
  const rootKeyInfo = useInspectKey(trustInfo.rootKeyId);
  const ref = useRef(null);

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
      }, 25);
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

  const boxVariants = {
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
        y: -1.3 * (rect.y) - window.scrollY,
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
      height: null,
      position: null,
      marginTop: '0vh',
    },
    final: {
      width: null,
    }
  };

  return (<motion.div key={'jiggle-box-'+trustId} animate={animation} variants={boxVariants}
    {... (detailDisclosure.isOpen ? swipeProps : {})} style={{marginLeft: '1em', marginRight: '1em'}}>
    <motion.div key={'trust-detail-'+trustId} initial={{y: -250, position: 'relative'}} animate={{y: 0}} transition={{delay: 0.25}}>
      <VStack pos='absolute' left='15px' top='-10px'>
        <Image src='/gold-lock-large.png' width='60px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5)'}}/>
      </VStack>
    </motion.div>
    <Box ref={ref} bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' height='100%'> 
      <HStack pl='5.2em' mt={detailDisclosure.isOpen? '1em' : '0em'}>
        <Text fontWeight='bold' fontSize='lg'>{trustInfo && trustInfo.name}</Text>
        <Spacer/>
        { detailDisclosure.isOpen && isDesktop && 
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/> }
        { !detailDisclosure.isOpen && (
          <Button onClick={toggleDetail} size='sm'>Admins</Button>
        ) }
      </HStack>
      { detailDisclosure.isOpen && <AdminManagementPanel trustId={trustId} trustInfo={trustInfo} rootKeyInfo={rootKeyInfo} toggleDetail={toggleDetail}/> } 
    </Box>
  </motion.div>)
}

const AdminManagementPanel = ({trustId, trustInfo, rootKeyInfo, toggleDetail, ...rest}) => {
  const holders = useKeyHolders(trustInfo.rootKeyId);
  // by default root keys won't have an inbox, but that's not the case for every account
  // on mainnet as of this writing, so we will ensure to filter it out so they dont accidentally
  // disable their root account address.
  const keyInboxAddress = useKeyInboxAddress(trustInfo.rootKeyId);
  const network = useNetwork();
  const keyLockerAddress = Networks.getContractAddress(network.chain.id, 'KeyLocker');
  const [filteredHolders, setFilteredHolders] = useState(null);
  
  useEffect(() => {
    if (holders.data && keyInboxAddress.data) {
      setFilteredHolders(holders.data.filter((h) => ![keyInboxAddress.data, keyLockerAddress].includes(h)));
    }
  }, [holders.data, keyInboxAddress.data]);

  return <Box mt='2em' textAlign='center' overflow='hidden'><KeyHoldersDetail 
    trustInfo={trustInfo}
    keyId={trustInfo.rootKeyId}
    keyInfo={rootKeyInfo}
    holders={filteredHolders || []}/></Box>
}

const TrustKeyList = ({trustId, trustInfo, trustKeys, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  const { detail } = useParams();
  const ref = useRef();
  return (<motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.25}}>
    <OnlyOnChains chains={[]}>
      <Box m='1em' mt='2em'>
        <RecoveryStatusBox keyId={trustInfo.rootKeyId} trustInfo={trustInfo} autoOpen={detail === 'recovery'}/>
      </Box>
    </OnlyOnChains>
    <Box m='1em'>
      <AddAccountButtonAndModal trustId={trustId} trustInfo={trustInfo}/>
    </Box>
    <List m='1em' spacing='1em'>
      { trustKeys.map((k,x) => <TrustKeyListItem key={'tklia'+k.toString()} trustInfo={trustInfo} keyId={k}/>) }
    </List>
  </motion.div>)
}

const AddAccountButtonAndModal = ({trustId, trustInfo, ...rest}) => {
  const isDesktop = useBreakpointValue({base: false, md: true});
  const detailDisclosure = useDisclosure();
  const animation = useAnimation();
  const ref = useRef(null);

  // hack we need this until recovery is out
  const network = useNetwork();

  const toggleDetail = function() {
    if (!detailDisclosure.isOpen) {
      detailDisclosure.onOpen();
      setTimeout(() => {
        animation.set('click');
        setTimeout(() => {
          animation.start('open');
        }, 3);
      }, 1);
    } else {
      detailDisclosure.onClose();
      setTimeout(async () => {
        await animation.start('close');
        animation.set('final');
      }, 25);
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

  const boxVariants = {
    click: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        position: 'fixed',
        zIndex: 500,
        x: rect.width - 100,
        width: 80,
        height: 20,
      };
    },
    open: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        x: 0,
        top: -1 * rect.y + 20, 
        zIndex: 500,
        width: rect.width,
        height: '95vh',
      }
    },
    close: {
      x: 0,
      y: 0,
      zIndex: 0,
      height: null,
      width: null,
      position: null,
    },
    final: {
      width: null,
    }
  };

  return (<Box ref={ref}>
    <HStack spacing='0'>
      <Text><b>Accounts:</b></Text>
      <Spacer/>
      <motion.div key={'jiggle-add-account-'+trustId} animate={animation} variants={boxVariants}
        {... (detailDisclosure.isOpen ? swipeProps : {})}> 
        <Box bg='white' borderRadius='lg' boxShadow='lg' p={detailDisclosure.isOpen ? '0.8em' : '0em'} height='100%'>
          { !detailDisclosure.isOpen && <Button size='sm' colorScheme='blue' onClick={toggleDetail}>New Account</Button> }
          { detailDisclosure.isOpen && isDesktop && <motion.div key='asset-detail-back'>
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/>
          </motion.div> }
          { detailDisclosure.isOpen && <AccountWizard trustId={trustId} trustInfo={trustInfo} toggleDetail={toggleDetail}/> }
        </Box>
      </motion.div>
    </HStack></Box>
  )
}

const AccountWizard = ({trustId, trustInfo, toggleDetail, ... rest}) => {
  const [renderPauseDone, setRenderPauseDone] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(null);
  const [receivers, setReceivers] = useState([]);

  const animations = {
    initial: {x: '50vw', opacity: 0},
    animate: {x: '0', opacity: 1, transition: {delay: 0.22, type: 'spring', stiffness: 100, damping: 20}}, 
    exit: {x: '-50vw', opacity: 0},
    transition: {duration: 0.2}
  };

  useEffect(() => {
    setTimeout(() => {
      setRenderPauseDone(true);
    }, 50);
  }, []);
  return renderPauseDone && (
    <VStack spacing='0' overflow='hidden'>
      <Box width='20em'>
        <AnimatePresence>
          { step === 0 && <motion.div key='add-account-0' {... animations}>
            <AccountWizardStepZero setStep={setStep}/>
          </motion.div> }
          { step === 1 && <motion.div key='add-recovery-1' {... animations}>
            <AccountWizardStepOne setStep={setStep} name={name} setName={setName}/>
          </motion.div> }
          { step === 2 && <motion.div key='review-account-2' {... animations}>
            <AccountWizardStepTwo trustInfo={trustInfo} setStep={setStep} name={name} receivers={receivers} setReceivers={setReceivers} toggleDetail={toggleDetail}/> 
          </motion.div> }
          { step === 3 && <motion.div key='add-account-user-3' {... animations}>
            <AccountWizardStepThree trustInfo={trustInfo} setStep={setStep} name={name} receivers={receivers} setReceivers={setReceivers}/> 
          </motion.div> }
        </AnimatePresence>
      </Box>
    </VStack>
  )
}

const AccountWizardStepZero = ({setStep}) => {
  return (
    <VStack width='100%' mt='2em' spacing='1em'>
      <Text align='center'>Create a new account in your <b>Trust</b> to:</Text>
      <HStack width='19em' align='stretch'>
        <FcApproval size='40px' align='top'/>
        <VStack align='stretch' width='80%' spacing='0'>
          <Text>Organize assets</Text>
          <Text fontSize='sm' color='gray.600'>Separate your funds by purpose.</Text>
        </VStack>
      </HStack>
      <HStack width='19em' align='stretch'>
        <FcApproval size='40px'/>
        <VStack align='stretch' width='80%' spacing='0'>
          <Text>Customize Permissions</Text>
          <Text fontSize='sm' color='gray.600'>Add and remove users easily.</Text>
        </VStack>
      </HStack>
      <HStack width='19em' align='stretch'>
        <FcApproval size='40px'/>
        <VStack align='stretch' width='80%' spacing='0'>
          <Text>Recover funds</Text>
          <Text fontSize='sm' color='gray.600'>Covered with your Trust recovery.</Text>
        </VStack>
      </HStack>
      <Button width='95%' colorScheme='blue' onClick={() => {setStep(1);}}>Next</Button>
    </VStack>
  )
}

const AccountWizardStepOne = ({setStep, name, setName}) => {
  const nameTooShort = (name||'').length < 3;
  return (
    <VStack width='100%' mt='2em' spacing='3em'>
      <Text align='center' width='20em'>Name your new <b>account</b>.</Text>
      <Input border='1px' borderColor={nameTooShort ? 'red' : 'gray.300'}
        bgColor='white' textAlign='center'
        placeholder='Savings' width='94%' size='lg'
        maxLength={15}
        p='1.4em'
        value={name||''}
        onChange={(e) => { setName(e.target.value); }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !nameTooShort) {
            setStep(2);
          }
        }}/>
      <Button width='95%' colorScheme='blue' isDisabled={nameTooShort} onClick={() => {setStep(2);}}>Next</Button>
    </VStack>
  )
}

const ReviewAccountName = ({setStep, trustInfo, name, ...rest}) => {
  const [index, setIndex] = useState(0); 
  const exampleAddresses = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x4E5d95F1D3d1b1FB4a169554A6bff1fD164ACa2c',
    '0x8a4c5612205C2a5ae2a7ff480F0f972496C96161'
  ];

  useEffect(() => {
    setTimeout(() => {
      setIndex((prev) => (prev) === (exampleAddresses.length - 1) ? 0 : prev+1);
    }, 1000);
  }, [index]);
  return ( <VStack spacing='0.5em' width='100%'>
    <Text><b>Account</b></Text>
    <HStack width='100%'>
      <AddressAvatar size='30' address={exampleAddresses[index]}/>
      <VStack spacing='0' align='stretch'>
        <Text>{name}</Text>
        <Text fontStyle='italic' fontSize='sm' color='gray.600'>{trustInfo.name}</Text>
      </VStack>
      <Spacer/>
      <Button size='md' borderRadius='full' onClick={() => {setStep(1);}}><FiEdit2/></Button>
    </HStack>
  </VStack> )
}

const AccountWizardStepTwo = ({trustInfo, setStep, name, receivers, setReceivers, toggleDetail}) => {
    const account = useAccount();

    return (
      <VStack width='100%' spacing='0.8em'>
        <ReviewAccountName setStep={setStep} name={name} trustInfo={trustInfo}/>
        <Text><b>Users</b></Text>
        <AnimatePresence>
          { receivers.length < 1 && 
            <Text color='gray.600' fontStyle='italic' as={motion.div}
              initial={{x: '50vw', opacity: 0, position: 'absolute'}}
              animate={{position: 'relative', x: 0, opacity: 1, transition: {delay: 0.20}}}>Currently no additional users added.</Text> }
        </AnimatePresence>
        <List width='100%' spacing='0.5em'>
          <AnimatePresence>
            { receivers.map((r) => (<ListItem key={'narli'+r} as={motion.div} exit={{x: '-50vw', opacity: 0, transition: {duration: 0.2}}}>
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
                <Text><DisplayAddress address={r}/></Text>
                <Spacer/>
                <IconButton size='sm' icon={<FiTrash2 size='22px' color='#ff7b47'/>} borderRadius='full' boxShadow='md'
                onClick={() => {setReceivers((prev) => prev.filter((user) => user !== r));}}/>
              </HStack>
            </ListItem>)) }
          </AnimatePresence>
        </List>
        <Button width='100%' onClick={() => {setStep(3);}}>Add User</Button>
        <CreateAccountConfirmationButton trustInfo={trustInfo} name={name} receivers={receivers} toggleDetail={toggleDetail}/>
      </VStack>
    )
}

const CreateAccountConfirmationButton = ({trustInfo, name, receivers, toggleDetail, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const navigate = useNavigate();

  // we are just going to assume its soulbound for now
  const keyCreator = useMegaKeyCreator(trustInfo.rootKeyId, name, receivers, receivers.map((r) => true),
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'CREATE_KEY',
        title: 'Create ' + name,
        subtitle: 'Add ' + receivers.length + ' users.', 
        data: data
      });
      toggleDetail();
    });

  return (<>
    <TransactionEstimate promise={keyCreator}/>
    <Button isDisabled={!keyCreator.write} isLoading={keyCreator.isLoading}
    width='100%' colorScheme='blue' onClick={() => {keyCreator.write?.();}}>Create Account</Button>
  </>)
}

const AccountWizardStepThree = ({trustInfo, setStep, name, receivers, setReceivers}) => {
  const [destination, setDestination] = useState(null); 
  const isValidAddress = ethers.utils.isAddress(destination);
  const duplicate = receivers.indexOf(destination) >= 0;

  const addDestination = function() {
    setReceivers((prev) => [prev, destination].flat(2));
    setStep(2);
  };

  return (
      <VStack width='100%' spacing='1em'>
        <Text><b>Add User Address</b></Text>
        <Input mt='2em' width='96%' value={destination || ''} size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
          onChange={(e) => {setDestination(e.target.value);}}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (isValidAddress && !duplicate)) {
              addDestination(); 
            }
          }}/>
        { isValidAddress && !duplicate && 
            <Text fontWeight='bold' textColor='green.600' fontSize='sm'>
              <DisplayAddress address={destination || ''}/></Text> }
        { isValidAddress && duplicate && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Address already added</Text> }
        { !isValidAddress && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid ethereum address</Text> }
        <Button width='100%' onClick={() => {setStep(2);}}>Nevermind</Button>
        <Button colorScheme='blue' width='100%' isDisabled={!isValidAddress || duplicate}
          onClick={addDestination}>Add User</Button>
      </VStack>
   )
}

const TrustKeyListItem = ({trustInfo, keyId, ...rest}) => {
  const keyInfo = useInspectKey(keyId);
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const keyHolders = useKeyHolders(keyId);
  const balanceSheet = useContextBalanceSheet(KEY_CONTEXT, keyId);

  const navigate = useNavigate();
  const isDesktop = useBreakpointValue({base: false, md: true});
  const detailDisclosure = useDisclosure();
  const animation = useAnimation();
  const ref = useRef(null);

  // we want to cross reference the holder list
  // with the one for the key-inbox address, and
  // reliably remove it
  const [filteredHolders, setFilteredHolders] = useState(null);
  useEffect(() => {
    if (keyHolders.data && keyInboxAddress.data) {
      setFilteredHolders(keyHolders.data.filter((h) => h !== keyInboxAddress.data));
    }
  }, [keyHolders.data, keyInboxAddress.data]);

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
      }, 25);
    }
  };

  const balanceVariants = {
    open: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        y: 100,
        x: -1 * (rect.width / 2) + 12,
        translateX: '50%',
        scale: 2,
        transition: {duration: 0.25}
      };
    },
    close: {
      y: 0,
      x: 0,
      translateX: '0%',
      scale: 1,
      transition: {duration: 0.25}
    }
  };

  const detailVariants = {
    open: {
      marginTop: '8em'
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

  return keyInboxAddress.data !== ethers.constants.AddressZero && (<ListItem key={'tkl-'+keyId.toString()}>
    <motion.div key={'jiggle-box-'+keyId} animate={animation} variants={boxVariants}
    {... (detailDisclosure.isOpen ? swipeProps : {})}>
    <Box ref={ref} bg='white' borderRadius='lg' boxShadow='lg' overflow='hidden' 
      style={{height: '100%', zIndex: 0, cursor: detailDisclosure.isOpen ? null : 'pointer'}} pos='relative'
      onClick={() => { if(!detailDisclosure.isOpen) { toggleDetail(); } }}>
      {keyInfo && <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}}> 
        { keyInfo.isRoot && <KeyIcon keyInfo={keyInfo} size='80px' 
          style={{
            opacity: detailDisclosure.isOpen ? 1 : 0.5,
            position: 'absolute',
            left: '-10px',
            top: detailDisclosure.isOpen ? '3px' : '-7px'
          }
        }/> }
        { !keyInfo.isRoot && keyInboxAddress.isSuccess && <Box
          pos='absolute' 
          left={detailDisclosure.isOpen ? '10px' : '6px'}
          top={detailDisclosure.isOpen ? '15px' : '5px'}
          style={{opacity: detailDisclosure.isOpen ? 1 : 0.5}}>
            <AddressAvatar size={50} address={keyInboxAddress.data}/>
        </Box> }
      </motion.div> }
      <HStack p={detailDisclosure.isOpen ? '0.8em' : '0.5em'} ml='3.5em'>
        <VStack align='stretch' spacing='0em'>
          <HStack spacing={detailDisclosure.isOpen ? '1em' : '0em'}>
            <Text fontWeight='bold' {... detailDisclosure.isOpen ? {fontSize: '22px'} : {}}>{keyInfo && keyInfo.alias}</Text>
            { detailDisclosure.isOpen && <AddressExplorerButton address={keyInboxAddress.data}/> }
          </HStack>
          { keyInboxAddress.data && (
            <HStack>
              <Text fontSize={detailDisclosure.isOpen ? 'md' : 'xs'}><DisplayAddress address={keyInboxAddress.data}/></Text>
              { detailDisclosure.isOpen && <CopyButton content={keyInboxAddress.data}/> }
            </HStack>)
          }
        </VStack>
        <Spacer/>
        <AnimatePresence>
          <motion.div key={'key-balance-'+keyId} animate={animation} variants={balanceVariants}>
            <ContextBalanceUSD contextId={KEY_CONTEXT} identifier={keyId}/>
          </motion.div>
        </AnimatePresence>
      </HStack>
      { detailDisclosure.isOpen && isDesktop && <motion.div key='asset-detail-back'>
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/>
          </motion.div> }
      { detailDisclosure.isOpen && (<VStack pos='relative' top='6em'>
          <Button size='sm' width='10em' onClick={() => {navigate('/key/' + keyId.toString() + '/deposit');}} >Deposit</Button> 
      </VStack>) }
      { detailDisclosure.isOpen && <motion.div animate={animation} variants={detailVariants}>
        <Tabs align='center' position='relative' variant='enclosed' size='lg'>
          <TabList>
            <Tab>{ filteredHolders && <Tag mr='0.5em'>{filteredHolders.length.toString()}</Tag> }Users</Tab>
            <Tab>{ balanceSheet.data && <Tag mr='0.5em'>{balanceSheet.data[0].length.toString()}</Tag> }Assets</Tab>
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="5px"
            bg="white"
            borderRadius="1px"/>
            <TabPanels>
              <TabPanel maxWidth='20em' p='0em'>
                <KeyHoldersDetail trustInfo={trustInfo} keyId={keyId} keyInfo={keyInfo} holders={filteredHolders || []}/>
              </TabPanel>
              <TabPanel maxWidth='20em' p='0em'>
                { balanceSheet.data && <KeyAssetDetail keyId={keyId} balanceSheet={balanceSheet.data}/> }
              </TabPanel>
            </TabPanels>
        </Tabs>
      </motion.div> }
    </Box>
  </motion.div></ListItem>)
}

const KeyHoldersDetail = ({trustInfo, keyId, keyInfo, holders, ...rest}) => {
 const transactions = useContext(TransactionListContext);

  // hook and contract state
  const account = useAccount();
  const userKeyBalance = useKeyBalance(keyId, account.address);
  const inbox = useKeyInboxAddress(keyId);

  // step state
  const [step, setStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);

  // selection state
  const [burnAddress, setBurnAddress] = useState(null);

  // transaction input
  const [destination, setDestination] = useState(null);
  const isValidAddress = ethers.utils.isAddress(destination);

  // validation state
  const destinationKeyBalance = useKeyBalance(keyId, destination);

  // contract call
  const copyKey = useCopyKey(trustInfo.rootKeyId, keyId, step === 3 ? destination : null, !keyInfo.isRoot,
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'COPY_KEY',
        title: 'Copy ' + keyInfo.alias,
        subtitle: 'Send to ' + destination.substring(0,6) + '...' + destination.substring(destination.length - 4), 
        data: data
      });
      processStep(0);
    });

  const processStep = (newStep) => {
    setPreviousStep(step);
    setStep(newStep);
  }

  return (<AnimatePresence mode='wait'>
    { step === 0 && !burnAddress && <motion.div key={'khd0-'+keyId} 
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
      { holders.length < 1 && <Alert mt='1em' status='info' fontSize='sm'>
        <AlertIcon/>
        Only admins have access right now.
      </Alert> }
      { holders.length > 0 && <Alert mt='1em' fontSize='sm' status={keyId.eq(trustInfo.rootKeyId) ? 'warning' : 'info'}>
        <AlertIcon/>
        { keyId.eq(trustInfo.rootKeyId) ? 'Trust admins control all accounts, users, and permissions.' :
            'These addresses have full access to the funds in this account.' }
      </Alert> }
      { holders.length > 0 && <List spacing='2em' mt='2em'>
          { holders.map((h) => (
            <motion.div layout key={'khd-'+keyId+h} initial={{x: '100vw'}} animate={{x: 0}} exit={{x: '-100vw'}}>
              <KeyHolderListItem key={'khli'+keyId+h} keyId={keyId} holder={h} burnAddress={burnAddress} setBurnAddress={setBurnAddress}/>
            </motion.div>)) }
      </List> }
      { burnAddress === null && <Button 
          mt='2em' colorScheme='blue' width='100%' onClick={() => {processStep(2);}}>
            { keyId.eq(trustInfo.rootKeyId) ? 'Add Trust Admin' : 'Add Account Access' }</Button> }
    </motion.div> }
    { burnAddress !== null && <motion.div layout key={'bhc-'+burnAddress+keyId}
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
        <BurnHolderConfirmation rootKeyId={trustInfo.rootKeyId} keyId={keyId} keyInfo={keyInfo} 
          holder={burnAddress} setBurnAddress={setBurnAddress} inbox={inbox} trustInfo={trustInfo}/>
    </motion.div> }
    { step === 2 && <motion.div layout key={'khd2-'+keyId} 
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
        <Input mt='2em' value={destination || ''} size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
          onChange={(e) => {setDestination(e.target.value);}}/>
        { isValidAddress && 
            <Text fontWeight='bold' textColor='green.600' fontSize='sm'>
              <DisplayAddress address={destination || ''}/></Text> }
        { !isValidAddress && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid ethereum address</Text> }
        { (destinationKeyBalance.isSuccess && destinationKeyBalance.data.gt(0)) && (
          <Text mt='1em' textColor='red.600' fontStyle='italic' fontSize='sm'>This address already has permission.</Text>
        ) }
        <Button mt='2em' width='100%' onClick={() => {processStep(0);}}>Nevermind</Button>
        <Button mt='2em' isDisabled={!isValidAddress || !destinationKeyBalance.isSuccess || !destinationKeyBalance.data.eq(0)} 
          colorScheme='blue' width='100%' onClick={() => {processStep(3);}}>Next</Button>
    </motion.div> }
    { step === 3 && <motion.div layout key={'khd3-'+keyId} 
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
      <VStack mt='1em' spacing='0.75em'> 
        <Text fontSize='lg' fontWeight='bold'>{trustInfo.rootKeyId.eq(keyId) ? 'Add Trust Admin' : 'Add Account User'}</Text>
        <HStack width='100%'>
          { trustInfo.rootKeyId.eq(keyId) ? 
              <Image src='/gold-lock-large.png' width='24px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5)'}}/> : 
                <AddressAvatar address={inbox.data}/> }
          <VStack align='stretch' spacing='0' pl='0.3em'>
            <Text align='left'>{keyInfo.alias}</Text>
            <Text align='left'fontSize='xs' color='gray' fontStyle='italic'>{trustInfo.name}</Text>
          </VStack>
          <Spacer/>
          <Button size='md' borderRadius='full' onClick={() => {processStep(0);}}><IoMdArrowRoundBack/></Button>
        </HStack>
        <HStack pos='relative' width='100%'>
          <AddressAvatar address={destination}/>
            { account.address === destination && <Spinner
              pos='absolute'
              left='-12px'
              thickness='2px'
              speed='2s'
              color='blue.500'
              size='lg'
            /> }
          <Text pl='0.3em'><DisplayAddress address={destination}/></Text>
          <CopyButton content={destination} size={'16px'}/>
          <Spacer/>
          <Button size='md' borderRadius='full' onClick={() => {processStep(previousStep);}}><FiEdit2/></Button>
        </HStack>
      </VStack>
      <Alert mt='1em' status={keyId.eq(trustInfo.rootKeyId) ? 'warning' : 'info'} fontSize='sm'>
        <AlertIcon/>
        { keyId.eq(trustInfo.rootKeyId) ? 'This user will become an admin of your Trust.' :
            'This user will have full access to the funds in this account.' }
      </Alert>
      <Button isDisabled={!copyKey.write} isLoading={copyKey.isLoading}
        mt='2em' colorScheme='blue' width='100%' onClick={() => {copyKey.write?.();}}>Confirm</Button>
    </motion.div> }
  </AnimatePresence>)
}

const KeyHolderListItem = ({keyId, holder, burnAddress, setBurnAddress, ...rest}) => {
  const account = useAccount();  

  return (<ListItem>
    <HStack pos='relative'>
      <VStack spacing='0em'>
        { account.address === holder && <Spinner
          pos='absolute'
          top='-4px'
          thickness='2px'
          speed='2s'
          color='blue.500'
          size='lg'
        /> }
        <AddressAvatar address={holder}/>
      </VStack>
      <HStack>
        <Text fontWeight='bold'><DisplayAddress address={holder}/></Text>
        <CopyButton content={holder} size={'16px'}/>
      </HStack>
      {burnAddress !== holder && <IconButton size='sm' right='0px' pos='absolute' icon={<FiTrash2 size='22px' color='#ff7b47'/>} borderRadius='full' boxShadow='md'
        onClick={()=>{setBurnAddress(holder);}}/> }
    </HStack>
  </ListItem>)
}

const BurnHolderConfirmation = ({rootKeyId, keyId, inbox, trustInfo, keyInfo, holder, setBurnAddress, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const account = useAccount();
  const keyBalance = useKeyBalance(keyId, holder);
  const burnKeys = useBurnKey(rootKeyId, keyId, holder, keyBalance.isSuccess ? keyBalance.data : null,
     (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'BURN_KEY',
        title: 'Remove Access',
        subtitle: 'Revoke ' + keyInfo.alias + ' from ' + holder.substring(0,6) + '...' + holder.substring(holder.length - 4),
        data: data
      });
      setBurnAddress(null);
    });

  return <VStack mt='2em' spacing='2em'> 
    <VStack spacing='1em' width='100%'>
      <HStack width='100%'>
        <Text fontSize='lg'><b>Remove:</b></Text>
        <Spacer/>
        <Box pos='relative'>
          { account.address === holder && <Spinner
            pos='absolute'
            left='-4px'
            top='-4px'
            thickness='2px'
            speed='2s'
            color='blue.500'
            size='lg'
          /> }
          <AddressAvatar address={holder}/>
        </Box>
        <Text><DisplayAddress address={holder}/></Text></HStack>
        <HStack width='100%'>
          <Text fontSize='lg'><b>From {keyId.eq(rootKeyId) ? 'Admin' : 'Account'}:</b></Text>
          <Spacer/>
          { keyId.eq(rootKeyId) ? 
            <Image src='/gold-lock-large.png' width='24px' style={{filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5)'}}/> : 
              <AddressAvatar address={inbox.data}/> }
          <VStack spacing='0' align='stretch'>
            <Text align='left'>{keyInfo.alias}</Text>
            <Text align='left' fontSize='xs' color='gray.600' fontStyle='italic'>{trustInfo.name}</Text>
          </VStack>
        </HStack>
    </VStack>
    { account.address === holder && <Alert fontSize='sm' status={keyInfo.isRoot ? 'error' : 'warning'}>
      <AlertIcon/>
      { !keyInfo.isRoot ? 'Careful. This is your address.' :
          'Danger! You will lose admin rights!' }
    </Alert> }
    <Button width='100%' onClick={() =>{setBurnAddress(null);}}>Nevermind</Button>
    <Button isDisabled={!burnKeys.write} isLoading={burnKeys.isLoading} 
      onClick={() => {burnKeys.write?.();}}
      width='100%' colorScheme='red'>Revoke Access</Button>
  </VStack>
}

const KeyAssetDetail = ({keyId, balanceSheet, ...rest}) => {
  return (<List mt='1em' spacing='0em'>
    { balanceSheet[0].map((arn, x) => <ListItem key={'kadli-'+keyId+arn} pt='1em' pb='1em' 
      {... x !== balanceSheet[0].length - 1 ? {borderBottom: '1px', borderColor: '#EFEFEF'} : {}}>
        <KeyAssetListItem
          keyId={keyId}
          arn={arn}
          balance={balanceSheet[1][x]}/>
      </ListItem>) }
  </List>)
}

const KeyAssetListItem = ({keyId, arn, balance, ...rest}) => {
  const navigate = useNavigate();
  const asset = useAssetMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const assetAmountFormatted = ethers.utils.formatUnits(balance, asset.decimals);
  const amountUSD = !assetPrice.isSuccess ? 0 : assetPrice.data * assetAmountFormatted;

  return (<HStack>
    {asset.icon()}
    <Text fontWeight='bold'>{asset.name}</Text>
    <Spacer/>
    <VStack align='stretch' spacing='0em' pr='0.25em'>
      <HStack><Spacer/><Text>{USDFormatter.format(amountUSD)}</Text></HStack>
      <HStack><Spacer/><Text align='right' fontSize='sm' color='gray'>{assetAmountFormatted} {asset.symbol}</Text></HStack>
    </VStack>
    <Button borderRadius='full' boxShadow='md' size='sm'
      onClick={() => {navigate('/key/' + keyId.toString() + '/send/' + arn);}}><FiSend/></Button>
  </HStack>)
}
