//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  React, 
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
  useKeyHolders
} from './hooks/contracts/KeyVault';
import {
  useTrustInfo,
  useTrustKeys,
  useInspectKey,
} from './hooks/contracts/Locksmith';
import {
  TRUST_CONTEXT,
  KEY_CONTEXT,
  useContextArnRegistry,
} from './hooks/contracts/Ledger';
import {
  useKeyInboxAddress
} from './hooks/contracts/PostOffice';

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
import { AiOutlineNumber } from 'react-icons/ai';
import { IoMdArrowRoundBack } from 'react-icons/io';

export function Trust() {
  const { trustId } = useParams();
  const trustInfo = useTrustInfo(trustId);
  const trustKeys = useTrustKeys(trustId);

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}} pos='relative'>
      <TrustHeader trustId={trustId} trustInfo={trustInfo}/>
      <TrustBalanceBox trustId={trustId}/>
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
          <TrustKeyListItem keyId={k}/>
        </ListItem>) }
      </AnimatePresence>
    </List>
  </motion.div>)
}

const TrustKeyListItem = ({keyId, ...rest}) => {
  const keyInfo = useInspectKey(keyId);
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const keyHolders = useKeyHolders(keyId);
  const keyArns = useContextArnRegistry(KEY_CONTEXT, keyId);

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
            <Tab>{ keyArns.data && <Tag mr='0.5em'>{keyArns.data.length.toString()}</Tag> }Assets</Tab>
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="5px"
            bg="white"
            borderRadius="1px"/>
            <TabPanels>
              <TabPanel maxWidth='20em' p='0em'>
                { filteredHolders && <KeyHoldersDetail keyId={keyId} holders={filteredHolders}/> }
              </TabPanel>
              <TabPanel maxWidth='20em' p='0em'>
                <Text>Assets</Text>
              </TabPanel>
            </TabPanels>
        </Tabs>
      </motion.div> }
    </Box>
  </motion.div>)
}

const KeyHoldersDetail = ({keyId, holders, ...rest}) => {
  return (<List spacing='2em' mt='2em'>
    <AnimatePresence>
      { holders.map((h) => (
        <motion.div key={'khd-'+keyId+h} initial={{x: '100vw'}} animate={{x: 0}} exit={{x: '100vw'}}>
          <KeyHolderListItem key={'khli'+keyId+h} keyId={keyId} holder={h}/>
        </motion.div>)) }
    </AnimatePresence>
  </List>)
}

const KeyHolderListItem = ({keyId, holder, ...rest}) => {
  const account = useAccount();  

  return (<ListItem>
    <HStack>
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
    </HStack>
  </ListItem>)
}
