//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { React, useState, useEffect, useRef } from 'react';
import {
  useParams
} from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Flex,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  Portal,
  Tabs,
  TabList,
  TabIndicator,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Spacer,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { QRCode } from 'react-qrcode-logo'
import { ethers } from 'ethers';
import { 
  useProvider, 
  useNetwork,
} from 'wagmi';
import { Networks } from './configuration/Networks';
import { LocksmithInterface } from './configuration/LocksmithInterface';

// hooks
import { useInspectKey } from './hooks/contracts/Locksmith';
import { useKeyInboxAddress } from './hooks/contracts/PostOffice';
import { 
  KEY_CONTEXT,
  useContextBalanceSheet
} from './hooks/contracts/Ledger';
import {
  USDFormatter,
  useCoinCapPrice,
} from './hooks/Prices';

// animations
import { 
  motion, 
  AnimatePresence,
  LayoutGroup,
  useAnimation,
} from 'framer-motion';
import { OverlayBlur } from './components/Animations';

// components
import { 
  AddressExplorerButton,
  CopyButton,
  KeyIcon
} from './components/Key';
import { DisplayAddress } from './components/Address';
import { ContextBalanceUSD } from './components/Ledger';

// icons
import { ImQrcode } from 'react-icons/im';

export function Key() {
  const { keyId } = useParams();
  const key = useInspectKey(keyId);

  return (key && <motion.div key={"key-"+keyId}>
    <Box ml={{base: 0, md: 72}}>
      <KeyHeader keyInfo={key}/>
      <BalanceContextInformation keyInfo={key}/>
    </Box>
  </motion.div>)
}

export function BalanceContextInformation({keyInfo, ...rest}) {
  const balanceSheet = useContextBalanceSheet(KEY_CONTEXT, keyInfo.keyId);

  return (<>
      <BalanceBox keyInfo={keyInfo}/>
      <ViewCarousel keyInfo={keyInfo} balanceSheet={balanceSheet}/>
  </>)
}

export function KeyHeader({keyInfo}) {
  // state
  const { keyId } = useParams();
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const [qrZIndex, setQrZIndex] = useState(null);
  const qrModal = useDisclosure();
  const qrAnimation = useAnimation();
  const marginAnimate = useBreakpointValue({base: '-185px', md: 0});
  
  // animations
  const qrZoomBack = () => {
    setQrZIndex(501);
    qrModal.onToggle();
    setTimeout(() => {
      setQrZIndex(null);
    }, 400);
  }; 
  // processing

  return (keyInfo && <motion.div key={"key-"+keyId}>
    <OverlayBlur disclosure={qrModal} onClose={qrZoomBack}/>
    <motion.div key={'key-detail-'+keyId} initial={{y: -250}} animate={{y: 0}} transition={{delay: 0.25}}>
      <VStack pos='absolute' top='-25px'>
        <KeyIcon keyInfo={keyInfo} size='140px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))'}}/> 
        <Text pos='relative' top='-105px' fontWeight='bold'>#{keyInfo.keyId}</Text>
      </VStack>
    </motion.div>
    <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' pl='7em'>
      <HStack>
        <VStack align='stretch'> 
          <HStack>
            <Heading fontSize='2xl'>{keyInfo.alias}</Heading>
            <AddressExplorerButton address={keyInboxAddress.data}/> 
          </HStack>
          { keyInboxAddress.data && 
            <HStack>
              <Text><DisplayAddress address={keyInboxAddress.data}/></Text> 
              <CopyButton content={keyInboxAddress.data}/>
            </HStack>
          }
        </VStack>
        <Spacer/>
        <LayoutGroup>
          <AnimatePresence>
            { keyInboxAddress.data && !qrModal.isOpen && <motion.a
                layoutId={"layout-key-" + keyId}
                initial={{color: '#808080'}}
                animate={qrAnimation}
                onClick={() => {
                  qrAnimation.start({color: '#808080', scale: 1});
                  qrModal.onToggle();
                }}
                onMouseEnter={() => {
                  qrAnimation.start({color: '#FFD700', scale: 1.3});
                }}
                onMouseLeave={() => {
                  qrAnimation.start({color: '#808080', scale: 1});
                }}
                style={{
                  cursor: 'pointer',
                  zIndex: qrZIndex,
                }}> 
                  <ImQrcode size='40px'/>
            </motion.a> }
            { qrModal.isOpen && <motion.a 
                layoutId={"layout-key-" + keyId}
                animate={{
                  marginLeft: marginAnimate,
                  top: '25%',
                }}
                onClick={qrZoomBack}
                style={{
                  position: 'absolute',
                  zIndex: 501,
                  left: '50%',
                  cursor: 'pointer'}}>
                    <QRCode size='350' ecLevel='H' value={keyInboxAddress.data} qrStyle='dots'
                      logoImage='/gold-lock-large.png' logoWidth='80' logoHeight='108'
                        eyeRadius={[
                          [20,20,0,20],
                          [20,20,20,0],
                          [20,0,20,20]
                    ]}/>
            </motion.a> }
          </AnimatePresence>
        </LayoutGroup>
      </HStack>
    </Box>
  </motion.div> )
}

const BalanceBox = ({keyInfo, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  return (
    <motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.125}}>
      <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'>
        <VStack>
          <ContextBalanceUSD contextId={KEY_CONTEXT} identifier={keyInfo.keyId}
            skeletonProps={{}} 
            textProps={{
              fontSize: '2xl',
              fontWeight: 'bold'
          }}/>
        </VStack>
      </Box>
    </motion.div>
  )
}

const ViewCarousel = ({keyInfo, balanceSheet, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  const network = useNetwork();
  const assets = Networks.getNetwork(network.chain.id).assets;

  return balanceSheet.data && (
    <motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.25}}>
      <List m='1em' mt='2em' spacing='2em'>
        { Object.keys(assets).map((arn) => balanceSheet.data[0].indexOf(arn) >= 0 && (
          <ListItem key={'asset-view-'+arn}>
            <AssetView 
              keyInfo={keyInfo} 
              arn={arn}
              balance={balanceSheet.data[1][balanceSheet.data[0].indexOf(arn)]} 
              asset={assets[arn]}/>
          </ListItem>
        )) }
      </List>
    </motion.div>
  )
}

const AssetView = ({ keyInfo, arn, balance, asset, ...rest }) => {
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const detailDisclosure = useDisclosure();
  const animate = useAnimation();
  const formatted = ethers.utils.formatUnits(balance, asset.decimals);
  const assetValue = assetPrice.isSuccess ? USDFormatter.format(assetPrice.data * formatted) : null;
  const ref = useRef(null);

  const logoVariants = {
    start: {
      opacity: 0.4,
      left: -30,
      scale: 1, 
      transition: {
        delay: 0.1, duration: 0.5
      }
    },
    open: {
      opacity: 1,
      left: -15,
      scale: 0.35,
      transition: {
        duration: 0.3
      }
    },
    close: {
      opacity: 0.4,
      left: -30,
      scale: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const nameVariants = {
    start: {},
    open: {
      scale: 1.5
    },
    close: {
      scale: 1
    }
  }

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
        y: -1 * (rect.y),
        marginTop: '10vh',
        height: '80vh',
        zIndex: 500
      }
    },
    close: {
      position: null,
      y: 0,
      x: 0,
      marginTop: 0,
      height: null,
      zIndex: 0 
    }
  };

  const balanceVariants = {
    open: function() {
      const rect = ref.current.getBoundingClientRect();
      return {
        y: 100,
        x: -1 * (rect.width / 2) + 12,
        translateX: '50%',
        scale: 1,
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

  useEffect(() => {
    // intro
    animate.start('start');
  }, [animate]);

  const toggleDetail = function() {
    if (!detailDisclosure.isOpen) {
      detailDisclosure.onOpen();
      setTimeout(() => {
        animate.set('click');
        animate.start('open');
      }, 1);
    } else {
      detailDisclosure.onClose();
      // maybe if I wait just two ticks,
      // it will render enough to get the right final height
      setTimeout(() => { animate.start('close'); }, 25);
    }
  };

  const swipeProps = {
    drag: true,
    dragConstraints: {top: 10, bottom: 10},
    onDragEnd: function(event, info) {
      if (Math.abs(info.offset.y) >= 10 ||
          Math.abs(info.offset.x) >= 10) {
        toggleDetail(); 
      }
    }
  };

  return (<AnimatePresence>
    <Box as={motion.div}
        key={'arn-box' + arn}
        {... (detailDisclosure.isOpen ? swipeProps : {})}
        ref={ref}
        boxShadow='lg'
        initial={{
          backgroundColor: 'white', borderRadius: '10px', 
          padding: 0, 
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        animate={animate}
        variants={boxVariants}
        onClick={!detailDisclosure.isOpen ? toggleDetail : () => { }}>
        <HStack position='relative' p='0.8em' borderRadius='lg'> 
          <motion.div
            initial={{opacity: 0, left: '100vw', scale: 2, position: 'absolute'}}
            animate={animate}
            variants={logoVariants}>
              {asset.icon({ size: 100})}
          </motion.div>
          <motion.div animate={animate} variants={nameVariants}>
            <Text pl='3.5em' fontWeight='bold'>{asset.name}</Text>
          </motion.div>
          <Spacer />
          <AnimatePresence>
            { !detailDisclosure.isOpen && (<motion.div animate={animate} variants={balanceVariants}>
              <VStack align="stretch">
                <HStack><Spacer/><Text>{assetValue}</Text></HStack>
                <HStack><Spacer/><Text fontSize="sm" color="gray">{formatted} {asset.symbol}</Text></HStack>
              </VStack>
            </motion.div>) }
            { detailDisclosure.isOpen && (<motion.div animate={animate} variants={balanceVariants}>
              <VStack>
                <motion.div initial={{scale: 1}} animate={{scale: 2}}>
                  <Text fontWeight='bold'>{assetValue}</Text>
                </motion.div>
                <motion.div initial={{scale: 1}} animate={{scale: 1.5}}>
                  <Text fontSize="sm" color="gray">{formatted} {asset.symbol}</Text>
                </motion.div>
              </VStack>
            </motion.div>) }
          </AnimatePresence>
        </HStack>
        <AnimatePresence>
        { detailDisclosure.isOpen && (
          <motion.div animate={animate} variants={detailVariants}>
            <Tabs align='center' position='relative' variant='enclosed' size='lg'> 
              <TabList>
                <Tab>Send</Tab>
                <Tab>Deposit</Tab>
              </TabList>
              <TabIndicator
                mt="-1.5px"
                height="5px"
                bg="white"
                borderRadius="1px"/>
              <TabPanels>
                <TabPanel>
                  <p>one!</p>
                </TabPanel>
                <TabPanel>
                  <p>two!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </motion.div>
        ) }
        </AnimatePresence>
      </Box>
    </AnimatePresence>)
};
