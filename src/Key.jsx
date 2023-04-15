//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { React, useState, useEffect } from 'react';
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
  LayoutGroup
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
  // state
  const { keyId } = useParams();
  const key = useInspectKey(keyId);
  const keyInboxAddress = useKeyInboxAddress(keyId);
  const qrModal = useDisclosure();
  const marginAnimate = useBreakpointValue({base: '-185px', md: 0});

  // animations

  // processing

  return (key && <motion.div key={"key-"+keyId}><Box ml={{base: 0, md: 72}}>
    <motion.div key={'key-detail-'+keyId} initial={{y: -500}} animate={{y: 0}} transition={{delay: 0.5}}>
      <VStack pos='absolute' top='-25px'>
        <KeyIcon keyInfo={key} size='140px' style={{filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))'}}/> 
        <Text pos='relative' top='-105px' zIndex='2' fontWeight='bold'>#{key.keyId}</Text>
      </VStack>
    </motion.div>
    <Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' pl='7em'>
      <HStack>
        <VStack align='stretch'> 
          <HStack>
            <Heading fontSize='2xl'>{key.alias}</Heading>
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
            onClick={qrModal.onToggle}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: '2em',
              top: '1.3em'
            }}
            initial={{opacity: 0, color: '#808080'}}
            animate={{opacity: 1}}
            whileHover={{color: '#FFD700', scale: 1.3}}
            exit={{opacity: 0, marginLeft: '-185px'}}
            whileTap={{scale: 0.9}}>
              <ImQrcode size='40px'/>
        </motion.a> }
        { qrModal.isOpen && <motion.a 
            layoutId={"layout-key-" + keyId}
            initial={{
              opacity: 0,
              right: '2em',
              top: '1.2em',
            }}
            animate={{
              opacity: 1,
              marginLeft: marginAnimate,
            }}
            exit={{opacity: 0}}
            onClick={qrModal.onToggle}
            style={{
              position: 'absolute',
              left: '50%',
              cursor: 'pointer'}}>
                <QRCode size='350' ecLevel='H' value={keyInboxAddress.data}/>
        </motion.a>}
      </AnimatePresence>
    </LayoutGroup>
  </Box></motion.div> ) 
}
