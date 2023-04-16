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
  Modal,
  ModalOverlay,
  Portal,
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

// animations
import { 
  motion, 
  AnimatePresence,
  LayoutGroup,
  useAnimation,
} from 'framer-motion';

// components
import { 
  AddressExplorerButton,
  CopyButton,
  KeyIcon
} from './components/Key';
import { DisplayAddress } from './components/Address';

// icons
import { ImQrcode } from 'react-icons/im';

export function Key() {
  const { keyId } = useParams();
  const key = useInspectKey(keyId);
  return (key && <motion.div key={"key-"+keyId}>
    <KeyHeader keyInfo={key}/>
    <Box ml={{base: 0, md: 72}}>
    <BalanceBox keyInfo={key}/>
    </Box>
  </motion.div>)
}

export function KeyHeader({keyInfo}) {
  // state
  const { keyId } = useParams();
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const qrModal = useDisclosure();
  const qrAnimation = useAnimation();
  const marginAnimate = useBreakpointValue({base: '-185px', md: 0});

  // animations

  // processing

  return (keyInfo && <motion.div key={"key-"+keyId}>
    <AnimatePresence>
    { qrModal.isOpen && <Box as={motion.div}
      data-blurry='blurry'
      initial={{opacity: 0}}
      animate={{opacity: 0.6}}
      exit={{opacity: 0}}
      onClick={qrModal.onClose}
      style={{
        position: 'fixed',
        left: 0,
        width: '500vw',
        top: -200,
        height: '500vh',
        cursor: 'pointer',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 500,
      }}/> 
    }
    </AnimatePresence>
    <Box ml={{base: 0, md: 72}}>
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
      </HStack>
    </Box>
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
              position: 'absolute',
              right: '2em',
              top: '1.3em'
            }}> 
              <ImQrcode size='40px'/>
        </motion.a> }
        { qrModal.isOpen && <motion.a 
            layoutId={"layout-key-" + keyId}
            initial={{
              right: '2em',
              top: '1.2em',
            }}
            animate={{
              marginLeft: marginAnimate
            }}
            onClick={qrModal.onToggle}
            style={{
              position: 'absolute',
              zIndex: 10000,
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
  </Box></motion.div> )
}

const BalanceBox = ({keyInfo, ...rest}) => {
  return (
    <motion.div initial={{x: '100vw'}} animate={{x: 0}} transition={{delay: 0.25}}>
      <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'>
        <VStack>
          <Heading>$1,353,354.05</Heading>
        </VStack>
      </Box>
    </motion.div>
  )
}

const ViewCarousel = ({keyInfo, ...rest}) => {
  return (
    <motion.div initial={{x: '100vw'}} animate={{x: 0}} transition={{delay: 0.50}}>
      <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'>
        Assets
      </Box>
    </motion.div>
  )
}
