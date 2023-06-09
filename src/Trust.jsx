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
  useParams
} from 'react-router-dom';
import {
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

import { 
  motion,
  AnimatePresence,
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
      <TrustBalanceBox trustId={trustId}/>
      <CreateKeyButton trustId={trustId} trustInfo={trustInfo}/>
      { trustInfo && trustKeys.isSuccess &&
        <TrustKeyList
          trustId={trustId}
          trustInfo={trustInfo}
          trustKeys={trustKeys.data}/> }
    </Box>
  </motion.div>) 
}

const CreateKeyButton = ({trustId, trustInfo, ...rest}) => {
  return (<Box m='1em' mt='2em' mb='0em'>
    <Button boxShadow='lg' width='100%' colorScheme='blue'>Create Key</Button>
  </Box>)
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
  return (<>
    <motion.div key={'trust-detail-'+trustId} initial={{y: -250}} animate={{y: 0}} transition={{delay: 0.25}}>
      <VStack pos='absolute' top='-16px' left='28px'>
        <Image src='/gold-lock-large.png' width='60px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5)'}}/>
      </VStack>
    </motion.div>
    <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' pl='6em'>
      <HStack>
        <Text fontWeight='bold' fontSize='lg'>{trustInfo && trustInfo.name}</Text>
        <Spacer/>
        <Tag size='md' variant='subtle' colorScheme='gray'>
          <TagLeftIcon as={AiOutlineNumber}/>
          <TagLabel>{trustId}</TagLabel>
        </Tag>
      </HStack>
    </Box>
  </>)
}

const TrustKeyList = ({trustId, trustInfo, trustKeys, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  return (<motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.25}}>
    <List spacing='1.8em' m='1em' mt='2em'>
      <AnimatePresence>
        { trustKeys.map((k,x) => <ListItem key={'tkli-'+k.toString()} pos='relative'>
          <TrustKeyListItem trustInfo={trustInfo} keyId={k}/>
        </ListItem>) }
      </AnimatePresence>
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

  return (<motion.div key={'jiggle-box-'+keyId} animate={animation} variants={boxVariants}
    {... (detailDisclosure.isOpen ? swipeProps : {})}>
    <Box ref={ref} bg='white' borderRadius='lg' boxShadow='lg' overflow='hidden' 
      style={{height: '100%', zIndex: 0, cursor: detailDisclosure.isOpen ? null : 'pointer'}} pos='relative'
      onClick={() => { if(!detailDisclosure.isOpen) { toggleDetail(); } }}>
      {keyInfo && <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}}> 
        <KeyIcon keyInfo={keyInfo} size='80px' 
          style={{
            opacity: detailDisclosure.isOpen ? 1 : 0.5,
            position: 'absolute',
            left: '-10px',
            top: detailDisclosure.isOpen ? '3px' : '-7px'
          }
        }/>
        <VStack pos='absolute' width='3.6em' top={detailDisclosure.isOpen ? '1.6em' : '0.9em'}>
          <Text fontSize='xs'>#{keyId.toString()}</Text>
        </VStack>
      </motion.div> }
      <HStack p='0.8em' ml='3.5em'>
        <VStack align='stretch' spacing='0em'>
          <HStack spacing='1em'>
            <Text fontWeight='bold' {... detailDisclosure.isOpen ? {fontSize: '22px'} : {}}>{keyInfo && keyInfo.alias}</Text>
            { detailDisclosure.isOpen && <AddressExplorerButton address={keyInboxAddress.data}/> }
          </HStack>
          { keyInboxAddress.data && detailDisclosure.isOpen && (
            <HStack>
              <Text><DisplayAddress address={keyInboxAddress.data}/></Text>
              <CopyButton content={keyInboxAddress.data}/>
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
            <Tab>{ filteredHolders && <Tag mr='0.5em'>{filteredHolders.length.toString()}</Tag> }Holders</Tab>
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
    { step === 0 && <motion.div layout key={'khd0-'+keyId} 
      initial={{x: 800, opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: -800, opacity: 0, transition: {duration: 0.2}}}> 
      <List spacing='2em' mt='2em'>
        <AnimatePresence>
          { holders.map((h) => (
            <motion.div key={'khd-'+keyId+h} initial={{x: '100vw'}} animate={{x: 0}} exit={{x: '100vw'}}>
              <KeyHolderListItem key={'khli'+keyId+h} keyId={keyId} holder={h}/>
            </motion.div>)) }
        </AnimatePresence>
      </List>
      <Button 
        mt='2em' colorScheme='blue' width='100%' onClick={() => {processStep(1);}}>Add Key Holder</Button>
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
      }}>Send Key to Me</Button>
      <Button mt='2em' width='100%' onClick={() => {processStep(2);}}>Send Key to Someone Else</Button>
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
        { !isValidAddress && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid destination address</Text> }
        { (destinationKeyBalance.isSuccess && destinationKeyBalance.data.gt(0)) && (
          <Text mt='1em' textColor='red.600' fontStyle='italic' fontSize='sm'>This address already holds this key.</Text>
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
        <Text fontSize='lg' fontWeight='bold'>Send</Text>
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
              top='-4px'
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
      <Button isDisabled={!copyKey.write} isLoading={copyKey.isLoading}
        mt='2em' colorScheme='blue' width='100%' onClick={() => {copyKey.write?.();}}>Confirm</Button>
    </motion.div> }
  </AnimatePresence>)
}

const KeyHolderListItem = ({keyId, holder, ...rest}) => {
  const account = useAccount();  

  return (<ListItem>
    <HStack>
      <VStack spacing='0em'>
        { account.address === holder && <Spinner
          pos='absolute'
          top='0px'
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
      <Spacer/>
      <IconButton size='sm' icon={<FiTrash2 size='22px' color='#ff7b47'/>} borderRadius='full' boxShadow='md'/>
    </HStack>
  </ListItem>)
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
