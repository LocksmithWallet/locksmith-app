//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { React, useState, useContext, useEffect, useRef } from 'react';
import {
  useParams
} from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  NumberInput,
  NumberInputField,
  Flex,
  IconButton,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tabs,
  TabList,
  TabIndicator,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Select,
  Skeleton,
  Spacer,
  Switch,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { QRCode } from 'react-qrcode-logo'
import { ethers } from 'ethers';
import { 
  useAccount,
  useBalance,
  useProvider, 
  useNetwork,
} from 'wagmi';
import { Networks } from './configuration/Networks';
import { LocksmithInterface } from './configuration/LocksmithInterface';

// hooks
import { GAS_ARN } from './configuration/AssetResource';
import { useInspectKey } from './hooks/contracts/Locksmith';
import { useKeyInboxAddress } from './hooks/contracts/PostOffice';
import {
  useSend,
  useSendToken,
} from './hooks/contracts/VirtualKeyAddress';
import { 
  KEY_CONTEXT,
  useContextBalanceSheet
} from './hooks/contracts/Ledger';
import {
  useDistribute
} from './hooks/contracts/Distributor';
import {
  useEtherVaultDeposit
} from './hooks/contracts/EtherVault';
import {
  useTokenVaultAllowance,
  useTokenVaultApprove,
  useTokenVaultDeposit,
} from './hooks/contracts/TokenVault';
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
import { AttentionSeeker, Fade } from 'react-awesome-reveal';
import { OverlayBlur } from './components/Animations';

// components
import {
  KeySelectOption,
  AddressExplorerButton,
  CopyButton,
  KeyIcon,
  KeyTrustName,
} from './components/Key';
import { DisplayAddress } from './components/Address';
import { ContextBalanceUSD } from './components/Ledger';
import {
  TransactionListContext
} from './components/TransactionProvider';

// icons
import { FiEdit2 } from 'react-icons/fi';
import { ImQrcode } from 'react-icons/im';
import { BiDollarCircle } from 'react-icons/bi';
import { IoMdArrowRoundBack } from 'react-icons/io';

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

const DepositButtonAndModal = ({keyInfo, ...rest}) => {
  const initialX = useBreakpointValue({base: '140vw', md: '100vw'});
  const disclosure = useDisclosure();
  const network = useNetwork();
  const assets = Networks.getNetwork(network.chain.id).assets;
  const ref = useRef(null);
  const [selectedArn, setSelectedArn] = useState(null);

  return (
    <motion.div initial={{x: initialX}} animate={{x: 0}} transition={{delay: 0.375}}>
      <VStack align='stretch'>
        <Button m='1em' p='1.4em' colorScheme='blue' boxShadow='lg'
          onClick={disclosure.onOpen}>Deposit</Button>
      </VStack>
      <Modal size='xl' onClose={disclosure.onClose} isOpen={disclosure.isOpen} isCentered motionPreset='scale'>
        <ModalOverlay backdropFilter='blur(10px)'/>
        <ModalContent>
          <ModalHeader>Deposit Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody ref={ref}>
            <List spacing='1em'>
              { selectedArn === null && (<Fade direction='down' duration='300' cascade>
              { Object.keys(assets).map((arn) => 
                <AssetChoiceListItem
                  keyInfo={keyInfo}
                  arn={arn}
                  asset={assets[arn]}
                  setArn={setSelectedArn}/>) }
              </Fade>)}
            </List>
            { selectedArn && <AssetDepositFlow
                keyInfo={keyInfo}
                arn={selectedArn}
                asset={assets[selectedArn]}
                container={ref}
                toggleDetail={disclosure.onClose}/>
            }
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  )
}

const AssetChoiceListItem = ({keyInfo, arn, asset, setArn, ...rest}) => {
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: asset.contractAddress // this won't work for NFTs.
  });

  return (<AttentionSeeker effect='pulse'><ListItem
    as={motion.div}
    whileTap={{scale: 0.95}}
    onClick={() => {setArn(arn);}}
    border='1px'
    borderColor='gray.300'
    bgColor='gray.100'
    boxShadow='md'
    borderRadius='full'
    padding='0.5em'
    cursor='pointer'>
      <HStack spacing='1em' pr='1em'>
        {asset.icon()}
        <Text>{asset.name}</Text>
        <Spacer/>
        <Text fontSize='sm'>{balance.isSuccess ? balance.data.formatted : '?'} {asset.symbol}</Text>
      </HStack>
  </ListItem></AttentionSeeker>)
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
      <DepositButtonAndModal keyInfo={keyInfo}/>
    </motion.div>
  )
}

const AssetView = ({ keyInfo, arn, balance, asset, ...rest }) => {
  const isDesktop = useBreakpointValue({base: false, md: true});
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
        y: -1 * (rect.y) - window.scrollY,
        marginTop: '3vh',
        minWidth: isDesktop ? '0' : '92vw',
        height: '90vh',
        zIndex: 500,
        overflow: 'scroll',
      }
    },
    close: {
      overflow: 'hidden',
      position: null,
      y: 0,
      x: 0,
      marginTop: 0,
      height: null,
      zIndex: 0,
    },
    final: {
      width: null
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
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        animate.set('click');
        animate.start('open');
      }, 1);
    } else {
      detailDisclosure.onClose();
      // maybe if I wait just two ticks,
      // it will render enough to get the right final height
      document.body.style.overflow = 'scroll';
      setTimeout(async () => { 
        await animate.start('close'); 
        animate.start('final');
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
            { detailDisclosure.isOpen && isDesktop && <motion.div key='asset-detail-back'>
              <IconButton pos='absolute' top='1em' right='1em' icon={<IoMdArrowRoundBack/>} borderRadius='full' boxShadow='md'
                onClick={toggleDetail}/>
            </motion.div> } 
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
                <TabPanel maxWidth='20em'>
                  <AssetSendFlow
                    keyInfo={keyInfo}
                    arn={arn}
                    balance={balance}
                    asset={asset}
                    price={assetPrice.data}
                    container={ref}
                    toggleDetail={toggleDetail}/>
                </TabPanel>
                <TabPanel maxWidth='20em'>
                  <AssetDepositFlow
                    keyInfo={keyInfo}
                    arn={arn}
                    asset={asset}
                    container={ref}
                    toggleDetail={toggleDetail}/>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </motion.div>
        ) }
        </AnimatePresence>
      </Box>
    </AnimatePresence>)
};

export const AssetDepositFlow = ({keyInfo, arn, asset, container, toggleDetail, ...rest}) => {
  const animate = useAnimation();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: asset.contractAddress // this won't work for NFTs.
  });
  const [amount, setAmount] = useState(0);
  const DepositButton = asset.contractAddress ? DepositTokenButton : DepositGasButton;
  const layoutMargin = useBreakpointValue({
    base: '0.5em',
    md: '2em',
  });

  const inputVariants = {
    tooMuch: {
      x: [-5, 5, -3, 3, -1, 0],
      transition: {type: 'linear'}
    }
  };

  return (<VStack mt={layoutMargin} spacing={layoutMargin}>
    <HStack width='100%'>
      <Button size='sm' onClick={() => {setAmount(balance.isSuccess ? balance.data.formatted : 0);}}>Max</Button>
      <Spacer/>
      { balance.isSuccess && (<VStack spacing='0em'>
        <Text fontSize='sm' fontStyle='italic'>You have</Text>
        <Text fontSize='lg' fontWeight='bold'>{balance.data.formatted} {asset.symbol}</Text> 
      </VStack>)}
      { !balance.isSuccess && <Skeleton height='3em' width='8em'/> } 
    </HStack>
    <motion.div key='input-for-deposit' animate={animate} variants={inputVariants}>
    <NumberInput
      min={0}
      onClick={() => {
        setTimeout(() => {
          container.current.scrollTo({
            top:  container.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 500);
      }}
      value={amount}
      max={balance.data ? balance.data.formatted : 0}
      onChange={(value) => {
        var cleaned = value.trim();
        if (cleaned[0] === '0') {
          cleaned = cleaned.substring(1);
        }
        setAmount(cleaned.length > 0 ? cleaned : 0);
        if (parseFloat(cleaned) > parseFloat(balance.data ? balance.data.formatted : 0)) {
          animate.start('tooMuch');
        }
      }}
      style={{
        overflow: 'hidden',
        borderRadius: '8px'
      }}
      keepWithinRange={true}
      clampValueOnBlur={true}>
        <NumberInputField
          style ={{
            paddingTop: '30px',
            paddingBottom: '30px',
            paddingLeft: '10px',
            paddingRight: '10px',
            boxShadow: '0 1px 3px inset rgba(0,0,0,0.4)',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize:'30px'
          }}/>
        <AnimatePresence>
          <motion.div key='input-as-asset' style={{opacity: 0.4, y: -75, x: -30, position: 'absolute'}}> 
                {asset.icon({ size: 90})}
          </motion.div>
        </AnimatePresence>
    </NumberInput>
    </motion.div>
    <DepositButton keyInfo={keyInfo} asset={asset} amount={amount}
      toggleDetail={toggleDetail}/>
  </VStack>)
}

export const DepositGasButton = ({keyInfo, asset, amount, toggleDetail, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const deposit = useEtherVaultDeposit(keyInfo.keyId, ethers.utils.parseUnits((parseFloat(amount)||0).toFixed(asset.decimals).toString(), asset.decimals), 
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'DEPSOT_ASSET',
        title: 'Deposit ' + asset.name,
        subtitle: amount + " " + asset.symbol, 
        data: data
      });
      toggleDetail();
    });

  return ( 
    <Button colorScheme='blue' isDisabled={parseFloat(amount) <= 0} isLoading={deposit.isLoading} boxShadow='lg' width='100%' size='lg'
      onClick={() => { deposit.write?.(); }}>
      Deposit {asset.symbol}
    </Button>
  )
}

export const DepositTokenButton = ({keyInfo, asset, amount, toggleDetail, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const account = useAccount();
  const allowance = useTokenVaultAllowance(asset.contractAddress, account.address);

  const approve = useTokenVaultApprove(asset.contractAddress, 
    ethers.utils.parseUnits((parseFloat(amount)||0).toFixed(asset.decimals).toString(), asset.decimals),
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'APPROVE_TOKEN',
        title: 'Approve ' + asset.name,
        subtitle: amount + " " + asset.symbol,
        data: data
      });
    });

  if (allowance.isSuccess && allowance.data.gte(ethers.utils.parseUnits((parseFloat(amount)||0).toString(), asset.decimals))) {
    return (<DepositTokenInternal 
      keyInfo={keyInfo}
      asset={asset}
      amount={amount}
      toggleDetail={toggleDetail}/>)
  }
  
  return (<>
    <VStack>
      <Text fontSize='sm' color='gray.500'>Your Current Allowance:</Text>
      <Text fontSize='xl' color='gray.500' fontWeight='bold'>
        {!allowance.isSuccess ? 0 : ethers.utils.formatUnits(allowance.data, asset.decimals)} {asset.symbol}
      </Text> 
    </VStack>
    <Button isDisabled={parseFloat(amount) <= 0 || !allowance.isSuccess || !approve.write}
    colorScheme='blue' boxShadow='lg' width='100%' size='lg' isLoading={approve.isLoading}
    onClick={() => { approve.write?.(); }}>Set Allowance</Button>
  </>)
}

export const DepositTokenInternal = ({keyInfo, asset, amount, toggleDetail, ...rest}) => {
  const transactions = useContext(TransactionListContext);
  const deposit = useTokenVaultDeposit(keyInfo.keyId, asset.contractAddress,
    ethers.utils.parseUnits((parseFloat(amount)||0).toFixed(asset.decimals).toString(), asset.decimals),
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'DEPSOT_ASSET',
        title: 'Deposit ' + asset.name,
        subtitle: amount + " " + asset.symbol,
        data: data
      });
      toggleDetail();
    });
    
  return (<Button isDisabled={parseFloat(amount) <= 0} isLoading={deposit.isLoading} colorScheme='blue' boxShadow='lg' width='100%' size='lg'
    onClick={() => { deposit.write?.(); }}>Deposit {asset.symbol}</Button>)
}

export const AssetSendFlow = ({keyInfo, arn, balance, asset, price, container, toggleDetail, ...rest}) => {
  const [step, setStep] = useState(0);
  const stepZeroAnimate = useAnimation();
  const stepZeroReview = useAnimation();

  const stepOneAnimate = useAnimation();
  const stepOneReview = useAnimation();

  const stepTwoAnimate = useAnimation();

  const stepAnimations = [stepZeroAnimate, stepOneAnimate, stepTwoAnimate];
  const reviewAnimations = [stepZeroReview, stepOneReview];

  const stepInitial = {
    x: 800,
    opacity: 0,
  };

  const stepVariants = {
    'in-next': {
      x: [800, 0], 
      opacity: [0,1],
    },
    'out-next': {
      x: [0, -800],
      opacity: [1,0],
    },
    'in-prev': {
      x: [-800, 0],
      opacity: [0,1],
    },
    'out-prev': {
      x: [0, 800],
      opacity: [1,0],
    }
  };

  useEffect(() => {
    stepZeroAnimate.start('in-next');
  }, []);

  const processStep = (newStep) => {
    // determine if we are going up or down
    const direction = newStep > step ? 'next' : 'prev';
    const oldStep = step;

    // play the appropriate directional outro
    // on the active step.
    if(direction === 'prev') {
      reviewAnimations[newStep].start('out-'+direction);
    }
    stepAnimations[step].start('out-'+direction);
    
    // once completed, set the step
    setTimeout(() => { setStep(newStep); }, 100);

    // to ensure its mounted, wait a little
    // longer, then play the intro on the new step
    setTimeout(() => {
      // also do it for the review of the previous step
      reviewAnimations[oldStep]?.start('in-'+direction);
      stepAnimations[newStep].start('in-'+direction);
    }, 125);
  };

  // step 1: amount
  const [isSendDollars, setSendDollars] = useState(false);
  const [amount, setAmount] = useState(0);

  // step 2: destination
  const [isSendKey, setSendKey] = useState(false);
  const [key, setKey] = useState(null);
  const [destination, setDestination] = useState('');

  // step 3: confirmation

  return (<AnimatePresence>
    { step === 0 && <motion.div key='send-step-0' animate={stepZeroAnimate} initial={stepInitial} variants={stepVariants}>
      <AssetSendDetail
        keyInfo={keyInfo}
        arn={arn}
        balance={balance}
        asset={asset}
        price={price}
        container={container}
        isSendDollars={isSendDollars}
        setSendDollars={setSendDollars}
        amount={amount}
        setAmount={setAmount}
        step={step}
        setStep={processStep}/>
    </motion.div> }
    { step >= 1 && <motion.div key='send-step-1' animate={stepZeroReview} initial={stepInitial} variants={stepVariants}>
      <HStack>
        {asset.icon()}
        <VStack align='stretch' spacing='0em'>
          <HStack fontWeight='bold' fontSize='0.8em'>
            { isSendDollars && <Text>{ amount / price } {asset.symbol}</Text> }
            { !isSendDollars && <Text>{amount} {asset.symbol}</Text> }
          </HStack>
          <HStack fontSize='0.8em' textColor='gray.600' fontStyle='italic' spacing='0.5em'>
            { isSendDollars && <Text>{USDFormatter.format(amount)}</Text> }
            { !isSendDollars && <Text>{USDFormatter.format(amount * price)}</Text> }
          </HStack>
        </VStack>
        <Spacer/>
        <Button borderRadius='full' onClick={() => {processStep(0);}}><FiEdit2/></Button>
      </HStack>
    </motion.div> 
    }
    { step >= 2 && <motion.div key='send-step-2-review' animate={stepOneReview} initial={stepInitial} variants={stepVariants}>
      <HStack mt='1em'>
        { isSendKey && <ReviewSelectedKeyInfo keyId={key}/> }
        { !isSendKey && <ImQrcode size={32}/> }
        { !isSendKey && <Text fontWeight='bold' fontSize='0.8em'><DisplayAddress address={destination}/></Text> }
        <Spacer/>
        <Button borderRadius='full' onClick={() => {processStep(1);}}><FiEdit2/></Button>
      </HStack>
    </motion.div> }
    { step === 1 && <motion.div key='step-one-destination' 
      animate={stepOneAnimate} initial={stepInitial} variants={stepVariants}>
        <SelectSendDestination
          keyInfo={keyInfo}
          isSendKey={isSendKey}
          setSendKey={setSendKey}
          destination={destination}
          setDestination={setDestination}
          keyDest={key}
          setKey={setKey}
          setStep={processStep}/>
    </motion.div> }
    { step === 2 && <motion.div key='step-two-looksie' style={{marginTop: '2em'}} 
        animate={stepTwoAnimate} initial={stepInitial} variants={stepVariants}>
      { isSendKey && <SendToKeyConfirmationButton
        keyInfo={keyInfo}
        destinationKey={key}
        arn={arn}
        asset={asset}
        amount={isSendDollars ? amount / price : amount}
        toggleDetail={toggleDetail}/> }
      { !isSendKey && <SendToEOAConfirmationButton
        keyInfo={keyInfo}
        destination={destination}
        arn={arn}
        asset={asset}
        amount={isSendDollars ? amount / price : amount}
        toggleDetail={toggleDetail}/> }
    </motion.div> }
  </AnimatePresence>)
}

export const ReviewSelectedKeyInfo = ({keyId, ...rest}) => {
  const selectedKeyInfo = useInspectKey(keyId);
  return selectedKeyInfo && (<>
  <KeyIcon keyInfo={selectedKeyInfo} size={32}/>
    <VStack align='stretch' fontSize='0.8em' spacing='0em'>
      <HStack><Text fontWeight='bold'>#{selectedKeyInfo.keyId}: {selectedKeyInfo.alias}</Text></HStack>
      <HStack><KeyTrustName keyInfo={selectedKeyInfo} fontStyle='italic' textColor='gray.600'/></HStack>
    </VStack>
  </>)
}

export const SendToEOAConfirmationButton = ({keyInfo, destination, arn, asset, amount, toggleDetail}) => {
  // we need to get the inbox, and then determine if its gas or not, and make
  // a choice that is going to break when we add new collateral providers.
  const keyInboxAddress = useKeyInboxAddress(keyInfo.keyId);
  return keyInboxAddress.isSuccess && (arn === GAS_ARN ? <SendGasButton
    keyInfo={keyInfo}
    inbox={keyInboxAddress.data}
    destination={destination}
    arn={arn}
    asset={asset}
    amount={amount}
    toggleDetail={toggleDetail}/> 
  : <SendTokenButton
    keyInfo={keyInfo}
    inbox={keyInboxAddress.data}
    destination={destination}
    arn={arn}
    asset={asset}
    amount={amount}
    toggleDetail={toggleDetail}/>)
}

export const SendGasButton = ({keyInfo, inbox, destination, arn, asset, amount, toggleDetail}) => {
  // we are making an assumption the token is in the ether vault right here
  const transactions = useContext(TransactionListContext);
  const network = useNetwork();
  const sendToken = useSend(inbox, Networks.getContractAddress(network.chain.id, 'EtherVault'),
    ethers.utils.parseUnits(amount.toString(), asset.decimals), destination,
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'SEND_ASSET',
        title: 'Send ' + asset.name,
        subtitle: amount.toString() + " " + asset.symbol,
        data: data
      });
      toggleDetail();
    });
  return <Button isDisabled={!sendToken.write} isLoading={sendToken.isLoading} colorScheme='blue' boxShadow='lg' width='100%' size='lg'
    onClick={() => {sendToken.write?.();}}>Confirm</Button>

}

export const SendTokenButton = ({keyInfo, inbox, destination, arn, asset, amount, toggleDetail}) => {
  // we are making an assumption the token is in the token vault right here
  const transactions = useContext(TransactionListContext);
  const network = useNetwork();
  const sendToken = useSendToken(inbox, Networks.getContractAddress(network.chain.id, 'TokenVault'),
    asset.contractAddress,
    ethers.utils.parseUnits(amount.toString(), asset.decimals), destination,
    (error) => {
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'SEND_ASSET',
        title: 'Send ' + asset.name,
        subtitle: amount.toString() + " " + asset.symbol,
        data: data
      });
      toggleDetail();
    });
  return <Button isDisabled={!sendToken.write} isLoading={sendToken.isLoading} colorScheme='blue' boxShadow='lg' width='100%' size='lg'
    onClick={() => {sendToken.write?.();}}>Confirm</Button>
}

export const SendToKeyConfirmationButton = ({keyInfo, destinationKey, arn, asset, amount, toggleDetail}) => {
  const network = useNetwork();
  const transactions = useContext(TransactionListContext);
 
  // the assumption about which provider we are using is going to break at some point in the near
  // future
  const distribution = useDistribute(Networks.getContractAddress(network.chain.id, asset.standard === 0 ? 'EtherVault' : 'TokenVault'),
    arn, keyInfo.keyId, [destinationKey], [ethers.utils.parseUnits(parseFloat(amount).toFixed(asset.decimals).toString(), asset.decimals)],
    (error) => { 
      console.log('error');
      console.log(error);
    }, (data) => {
      transactions.addTransaction({
        type: 'SEND_ASSET',
        title: 'Send ' + asset.name,
        subtitle: amount.toString() + " " + asset.symbol,
        data: data
      });
      toggleDetail();
    });
  return <Button size='lg' boxShadow='lg' colorScheme='blue' width='100%' isLoading={distribution.isLoading} onClick={() => {distribution.write?.();}}>Confirm</Button>
}

export const SelectSendDestination = ({keyInfo, isSendKey, setSendKey, destination, setDestination, keyDest, setKey, setStep, ...rest}) => {
  const isValidAddress = !isSendKey && ethers.utils.isAddress(destination);
  const isValidKey = isSendKey && /[0-9]+/.test(keyDest);

  return (<VStack align='stretch' mt='2em' spacing='1em'>
    <HStack>
      <Spacer/>
      <Text fontSize='sm' {... (!isSendKey ? {fontWeight: 'bold'} : {})}>EOA</Text>
      <Switch size='lg' {... isSendKey ? {defaultChecked: true} : {}} onChange={(e) => {
        setSendKey(e.target.checked);
      }}/>
      <Text fontSize='sm' {... (isSendKey ? {fontWeight: 'bold'} : {})}>Key</Text>
    </HStack>
    <AnimatePresence mode='wait'>
    { !isSendKey && 
      <motion.div key='send-address-motion' 
          initial={{opacity: 0, x: 500}} 
          transition={{duration: 0.2}}
          animate={{opacity: 1, x: 0}}
          exit={{opacity: 0, x: 500}}> 
        <Input value={destination} size='md' mb='0.5em' placeholder='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
          onChange={(e) => {
            setDestination(e.target.value);
        }}/>
        { isValidAddress && <Text fontWeight='bold' textColor='green.600' fontSize='sm'><DisplayAddress address={destination || ''}/></Text> }
        { !isValidAddress && <Text textColor='red.600' fontStyle='italic' fontSize='sm'>Enter valid destination address</Text> }
      </motion.div>
    }
    { isSendKey && 
      <motion.div key='send-key-motion'
          initial={{opacity: 0, x: -500}} 
          transition={{duration: 0.2}}
          animate={{opacity: 1, x: 0}}
          exit={{opacity: 0, x: -500}}> 
        <Select placeholder='Select Treasury Key' mb='1.75em' 
            value={(keyDest||'').toString()}
            onChange={(e) => { setKey(e.target.value); }}>
          { keyInfo.trustKeys.filter((k) => k.toString() !== keyInfo.keyId.toString()).map((k) => <KeySelectOption 
            key={'kso-'+k} keyId={k.toString()} selected={(keyDest||'').toString() === k.toString()}
          /> ) }
        </Select> 
      </motion.div>}
    </AnimatePresence>
    <Box width='100%'>
      <Button { ...(isValidAddress || isValidKey ? {} : {isDisabled: true})}size='lg' width='100%' boxShadow='md'
        onClick={() => {setStep(2);}}>Next</Button>
    </Box>
  </VStack>)
}

export const AssetSendDetail = ({keyInfo, arn, balance, asset, price, container, isSendDollars, setSendDollars, amount, setAmount, step, setStep, ...rest}) => {
  const animate = useAnimation();
  const formattedBalance = ethers.utils.formatUnits(balance, asset.decimals);
  const layoutMargin = useBreakpointValue({
    base: '0.5em',
    md: '2em',
  });
  const maximumAmount = isSendDollars ? price * formattedBalance : formattedBalance; 
  const tooMuch = parseFloat(amount) > maximumAmount || parseFloat(amount) <= 0;

  const inputIconProps = {
    initial: {opacity: 0, y: 0, x: -100, position: 'absolute'},
    animate: {opacity: 0.4, y: -75, x: -30},
    exit:    {opacity: 0, y: -150, x: -100, position: 'absolute'},
    transition: {duration: 0.25}
  };

  const cleanSymbolAmount = ("" + (amount / price)).length >= 8 ? (amount/price).toPrecision(8) :
    amount/price;

  const inputVariants = {
    tooMuch: {
      x: [-5, 5, -3, 3, -1, 0],
      transition: {type: 'linear'}
    }
  };

  return (<VStack mt={layoutMargin} spacing={layoutMargin}>
    <HStack width='100%'>
      <Button size='sm' onClick={() => {setAmount(maximumAmount);}}>Max</Button>
      <Spacer/>
      <Text fontSize='sm' {... (!isSendDollars ? {fontWeight: 'bold'} : {})}>{asset.symbol}</Text>
      <Switch size='lg' {... isSendDollars ? {defaultChecked: true} : {}} onChange={(e) => {
        setSendDollars(e.target.checked);
      }}/>
      <Text fontSize='sm' {... (isSendDollars ? {fontWeight: 'bold'} : {})}>USD</Text>
    </HStack>
    <motion.div variants={inputVariants} animate={animate}>
    <NumberInput
      min={0}
      onClick={() => {
        setTimeout(() => {
          container.current.scrollTo({
            top:  container.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 500);
      }}
      value={amount}
      max={maximumAmount}
      onChange={(value) => {
        var cleaned = value.trim();
        if (cleaned[0] === '0') {
          cleaned = cleaned.substring(1);
        }
        setAmount(cleaned.length > 0 ? cleaned : 0);
        if (parseFloat(cleaned) > maximumAmount) {
          animate.start('tooMuch');
        }
      }}
      style={{
        overflow: 'hidden',
        borderRadius: '8px'
      }}
      keepWithinRange={true}
      clampValueOnBlur={true}>
        <NumberInputField 
          style ={{
            paddingTop: '30px',
            paddingBottom: '30px',
            paddingLeft: '10px',
            paddingRight: '10px',
            boxShadow: '0 1px 3px inset rgba(0,0,0,0.4)',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize:'30px'
          }}/>
        <AnimatePresence>
            { !isSendDollars && (<motion.div key='input-as-asset' {... inputIconProps}>
                {asset.icon({ size: 90})}
            </motion.div>) }
            { isSendDollars && (<motion.div key='input-as-dollars' {... inputIconProps}>
              <BiDollarCircle size='90px' color='#118C4F'/>
            </motion.div>) }
        </AnimatePresence>
    </NumberInput>
    </motion.div>
    <AnimatePresence mode='wait'>
      { isSendDollars && <motion.div key='asset-fade' initial={{opacity: 0, x: -100}} animate={{opacity: 1, x: 1}} exit={{opacity: 0, x: 100}}
        transition={{duration: 0.1}}>
        <Text fontSize='xl' color='gray.500' fontWeight='bold'>{cleanSymbolAmount} {asset.symbol}</Text>
      </motion.div>}
      { !isSendDollars && <motion.div key='dollar-fade' initial={{opacity: 0, x: -100}} animate={{opacity: 1, x: 1}} exit={{opacity: 0, x: 100}}
        transition={{duration: 0.1}}>
        <Text fontSize='xl' color='gray.500' fontWeight='bold'>{USDFormatter.format(amount * price)}</Text> 
      </motion.div>}
    </AnimatePresence>
    <Box width='100%' pt={layoutMargin}>
      <Button { ...(tooMuch ? {isDisabled: true} : {})}size='lg' width='100%' boxShadow='md'
        onClick={() => {setStep(1);}}>Next</Button>
    </Box>
  </VStack>)
}
