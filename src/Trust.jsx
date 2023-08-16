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
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function Trust() {
  const { trustId } = useParams();
  const trustInfo = useTrustInfo(trustId);
  const trustKeys = useTrustKeys(trustId);

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}} pos='relative'>
      <TrustHeader trustId={trustId} trustInfo={trustInfo}/>
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
        y: -1.5 * (rect.y) - window.scrollY,
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
        { !detailDisclosure.isOpen &&
          <Button size='sm' colorScheme='blue' onClick={toggleDetail}>Add Account</Button> }
        { detailDisclosure.isOpen && isDesktop && 
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/> }
      </HStack>
      { detailDisclosure.isOpen && <CreateKeyFlow trustId={trustId} trustInfo={trustInfo} toggleDetail={toggleDetail}/> } 
    </Box>
  </motion.div>)
}

const CreateKeyFlow = ({trustId, trustInfo, toggleDetail, ...rest}) => {
  const account = useAccount();
  const [step, setStep] = useState(0);
  const [keyName, setKeyName] = useState('');
  const [destination, setDestination] = useState('');
  const stepAnimation = {
    initial: {x: '100vw'},
    animate: {x: 0, transition:{duration: 0.2, delay: 0.15}},
    exit: {x: '-100vw', transition: {duration: 0.1}},
  };

  const nameTooShort = (keyName||'').length < 3;
  const isValidAddress = ethers.utils.isAddress(destination);
  
  return (
    <VStack mt='2em' pos='relative' overflow='hidden' height='100%' m='-0.90em'>
      <AnimatePresence>
      { step === 0 && (<motion.div key='create-key-0' style={{position: 'relative'}}>
        <Box as={motion.div} {... stepAnimation} pos='relative'>
          <KeyIcon keyInfo={{isRoot: false}} size='500px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))'}}/>
          <Text pos='absolute' top='50px' left='195px' color='white'>Name Your Account</Text>
          <Input pos='absolute' top='84px' left='160px' border='1px' borderColor={nameTooShort ? 'red' : 'gray.300'}
              bgColor='white' textAlign='center'
              placeholder='Savings' width='10em' size='lg'
              maxLength={15}
              p='1.4em'
              value={keyName}
              onChange={(e) => {
                setKeyName(e.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !nameTooShort) {
                  setStep(1); 
                }
              }}
            />
            <Button pos='absolute' top='160px' left='160px' width='180px' 
              isDisabled={nameTooShort} boxShadow='lg' colorScheme='blue'
              onClick={() => {setStep(1);}}>Next</Button>
        </Box>
      </motion.div>) }
      { step > 0 && (<motion.div key='review-key-0' {... stepAnimation}>
        <HStack mt='4em' mb='1em'width='20em'>
          <KeyIcon keyInfo={{isRoot: false}} size={32}/>
          <Text fontWeight='bold'>{keyName}</Text>
          <Spacer/>
          <Button borderRadius='full' onClick={() => {setStep(0);}}><FiEdit2/></Button>
        </HStack>
      </motion.div>) }
      { step > 2 && (<motion.div key='review-key-3' {... stepAnimation}>
        <HStack width='20em' pl='0.3em'>
          <Box pos='relative'>
            { account.address === destination && <Spinner
              pos='absolute'
              thickness='2px'
              top='-4px'
              left='-4px'
              speed='2s'
              color='blue.500'
              size='lg'
            /> } 
            <AddressAvatar address={destination}/>
          </Box>
          <Text fontWeight='bold' pl='0.1em'><DisplayAddress address={destination}/></Text>
          <Spacer/>
          <Button borderRadius='full' onClick={() => {setStep(1);}}><FiEdit2/></Button>
        </HStack>
      </motion.div>) }
      { step === 1 && (<motion.div key='create-key-2' {... stepAnimation} style={{margin: '1em', width: '20em'}}>
        <Button width='100%'
          onClick={() => {
            setDestination(account.address);
            setStep(3);
        }}>Add Me</Button>
        <Button mt='2em' width='100%' onClick={() => {setStep(2);}}>Add Someone Else</Button>
      </motion.div>) }
      { step === 2 && (<motion.div key='create-key-3' {... stepAnimation} style={{marginTop: '2em', width: '20em'}}>
          <VStack spacing='1em'>
            <Input fontSize='xs' width='26em' value={destination} size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
              onChange={(e) => {
                setDestination(e.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && isValidAddress) {
                  setStep(3);
                }
              }} 
            />
            { isValidAddress && <Text fontWeight='bold' textColor='green.600' fontSize='sm'><DisplayAddress address={destination || ''}/></Text> }
            { !isValidAddress && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid destination address</Text> }
          <Button width='100%' onClick={() => {setStep(1);}}>Back</Button>
          <Button isDisabled={!isValidAddress} width='100%' colorScheme='blue' onClick={() => {setStep(3);}}>Next</Button>
        </VStack>
      </motion.div>) }
      { step === 3 && (<motion.div key='create-key-3' {... stepAnimation} style={{marginTop:'2em', width: '20em'}}>
        <CreateKeyConfirmationButton 
          trustId={trustId}
          trustInfo={trustInfo}
          keyName={keyName}
          destination={destination} toggleDetail={toggleDetail}/>
      </motion.div>) }
      </AnimatePresence>
    </VStack>)
}

const CreateKeyConfirmationButton = ({trustId, trustInfo, keyName, destination, toggleDetail, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const navigate = useNavigate();

  // we are just going to assume its soulbound for now
  const keyCreator = useMegaKeyCreator(trustInfo.rootKeyId, keyName, destination, true,
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'CREATE_KEY',
        title: 'Mint ' + keyName,
        subtitle: 'Send to ' + destination.substring(0,6) + '...' + destination.substring(destination.length - 4),
        data: data
      });
      toggleDetail();
    });

  return (<Button isDisabled={!keyCreator.write} isLoading={keyCreator.isLoading}
    width='100%' colorScheme='blue' onClick={() => {keyCreator.write?.();}}>Create Account</Button>)
}

const TrustKeyList = ({trustId, trustInfo, trustKeys, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  const { detail } = useParams();
  return (<motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.25}}>
    <List spacing='1.8em' m='1em' mt='2em'>
        { trustKeys.map((k,x) => <ListItem key={'tkli-'+k.toString()} pos='relative'>
          <TrustKeyListItem trustInfo={trustInfo} keyId={k}/>
        </ListItem>) }
        <OnlyOnChains chains={[31337]}>
          <ListItem key={'recovery-key'} pos='relative'>
            <RecoveryStatusBox keyId={trustInfo.rootKeyId} trustInfo={trustInfo} autoOpen={detail === 'recovery'}/>
          </ListItem>
        </OnlyOnChains>
    </List>
  </motion.div>)
}

const TrustKeyListItem = ({trustInfo, keyId, ...rest}) => {
  const keyInfo = useInspectKey(keyId);
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const keyHolders = useKeyHolders(keyId);
  const balanceSheet = useContextBalanceSheet(KEY_CONTEXT, keyId);

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

  return keyInboxAddress.data !== ethers.constants.AddressZero && (<motion.div key={'jiggle-box-'+keyId} animate={animation} variants={boxVariants}
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
          <motion.div animate={animation} variants={balanceVariants}>
            <ContextBalanceUSD contextId={KEY_CONTEXT} identifier={keyId}/>
          </motion.div>
        </AnimatePresence>
      </HStack>
      { detailDisclosure.isOpen && isDesktop && <motion.div key='asset-detail-back'>
          <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
            onClick={toggleDetail}/>
          </motion.div> }
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
  </motion.div>)
}

const KeyHoldersDetail = ({trustInfo, keyId, keyInfo, holders, ...rest}) => {
 const transactions = useContext(TransactionListContext);

  // hook and contract state
  const account = useAccount();
  const userKeyBalance = useKeyBalance(keyId, account.address);

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
  const copyKey = useCopyKey(trustInfo.rootKeyId, keyId, destination, !keyInfo.isRoot,
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
        { keyId.eq(trustInfo.rootKeyId) ? 'These addresses have full admin permissions to your Trust.' :
            'These addresses have full access to the funds in this account.' }
      </Alert> }
      { holders.length > 0 && <List spacing='2em' mt='2em'>
          { holders.map((h) => (
            <motion.div layout key={'khd-'+keyId+h} initial={{x: '100vw'}} animate={{x: 0}} exit={{x: '-100vw'}}>
              <KeyHolderListItem key={'khli'+keyId+h} keyId={keyId} holder={h} burnAddress={burnAddress} setBurnAddress={setBurnAddress}/>
            </motion.div>)) }
      </List> }
      { burnAddress === null && <Button 
          mt='2em' colorScheme='blue' width='100%' onClick={() => {processStep(1);}}>Add Account Access</Button> }
    </motion.div> }
    { burnAddress !== null && <motion.div layout key={'bhc-'+burnAddress+keyId}
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
        <BurnHolderConfirmation rootKeyId={trustInfo.rootKeyId} keyId={keyId} keyInfo={keyInfo} 
          holder={burnAddress} setBurnAddress={setBurnAddress}/>
    </motion.div> }
    { step === 1 && <motion.div layout key={'khd1-'+keyId}
      initial={{x: 800, opacity: 0}} 
      animate={{x: 0, opacity:1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
      <Button mt='2em' width='100%' 
        isDisabled={!userKeyBalance.isSuccess || userKeyBalance.data.gt(0)}
        onClick={() => {
          setDestination(account.address);
          processStep(3);
      }}>Add Myself</Button>
      <Button mt='2em' width='100%' onClick={() => {processStep(2);}}>Add Someone Else</Button>
      <Button mt='2em' colorScheme='blue' width='100%' onClick={() => {processStep(0);}}>Nevermind</Button>
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
        <Button mt='2em' width='100%' onClick={() => {processStep(1);}}>Back</Button>
        <Button mt='2em' isDisabled={!isValidAddress || !destinationKeyBalance.isSuccess || !destinationKeyBalance.data.eq(0)} 
          colorScheme='blue' width='100%' onClick={() => {processStep(3);}}>Next</Button>
    </motion.div> }
    { step === 3 && <motion.div layout key={'khd3-'+keyId} 
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}>
      <VStack mt='1em' spacing='0em'> 
        <Text fontSize='lg' fontWeight='bold'>Add Permission</Text>
        <HStack width='100%' pt='1em'>
          <KeyIcon keyInfo={keyInfo} size={32}/>
          <Text><b>{keyInfo.alias}</b></Text>
          <Text fontSize='sm' color='gray' fontStyle='italic'>(#{keyInfo.keyId.toString()})</Text>
          <Spacer/>
          <Button size='md' borderRadius='full' onClick={() => {processStep(0);}}><IoMdArrowRoundBack/></Button>
        </HStack>
        <HStack pl='0.3em' pos='relative' width='100%' pt='2em'>
            { account.address === destination && <Spinner
              pos='absolute'
              left='8px'
              top='36px'
              thickness='2px'
              speed='2s'
              color='blue.500'
              size='lg'
            /> }
          <AddressAvatar address={destination}/>
          <Text pl='0.3em' fontWeight='bold'><DisplayAddress address={destination}/></Text>
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

const BurnHolderConfirmation = ({rootKeyId, keyId, keyInfo, holder, setBurnAddress, ...rest}) => {
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
    <VStack fontSize='lg'>
      <HStack><Text>Revoke</Text><KeyIcon size={32} keyInfo={keyInfo}/><Text><b>{keyInfo.alias}</b></Text></HStack>
      <Text>from wallet</Text>
      <HStack>
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
        <Text><b><DisplayAddress address={holder}/></b>?</Text></HStack>
    </VStack>
    { account.address === holder && <Alert fontSize='sm' status={keyInfo.isRoot ? 'error' : 'warning'}>
      <AlertIcon/>
      { !keyInfo.isRoot ? 'Careful. This is your own wallet.' :
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
  const asset = useAssetMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const assetAmountFormatted = ethers.utils.formatUnits(balance, asset.decimals);
  const amountUSD = !assetPrice.isSuccess ? 0 : assetPrice.data * assetAmountFormatted;

  return (<HStack>
    {asset.icon()}
    <Text fontWeight='bold'>{asset.name}</Text>
    <Spacer/>
    <VStack align='stretch' spacing='0em'>
      <HStack><Spacer/><Text>{USDFormatter.format(amountUSD)}</Text></HStack>
      <HStack><Spacer/><Text align='right' fontSize='sm' color='gray'>{assetAmountFormatted} {asset.symbol}</Text></HStack>
    </VStack>
  </HStack>)
}
