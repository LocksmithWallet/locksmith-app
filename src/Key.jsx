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

  // animations

  // processing

  return (key && <motion.div key={"key-"+keyId}>
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
            <LayoutGroup>
              <AnimatePresence>
                { keyInboxAddress.data && !qrModal.isOpen && <motion.a
                  layoutId={"key-qr-" + keyId} 
                  onClick={qrModal.onToggle}
                  exit={{opacity: 0}}
                  style={{cursor: 'pointer'}}
                  initial={{opacity: 0, color: '#808080'}}
                  animate={{opacity: 1}}
                  whileHover={{color: '#FFD700', scale: 1.3}}
                  whileTap={{scale: 0.9}}>
                    <ImQrcode size='40px'/>
                </motion.a> }
                {qrModal.isOpen && <motion.a 
                  layoutId={"key-qr-" +keyId}
                  onClick={qrModal.onToggle}
                  initial={{color: '#000'}}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translate(-200px, 0px)'
                  }}>
                    <ImQrcode size='100px'/>
                </motion.a>}
              </AnimatePresence>
            </LayoutGroup>
          </HStack>
        </Box>
    </motion.div> 
  ) 
}
