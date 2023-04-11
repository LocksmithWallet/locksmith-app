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
  Input,
  Tag,
  TagLabel,
  Text,
  Skeleton,
  Spacer,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { 
  useProvider, 
  useNetwork,
} from 'wagmi';
import { Networks } from './configuration/Networks';
import { LocksmithInterface } from './configuration/LocksmithInterface';
import { getReceiptEvents } from './hooks/Utils';

import { BsHammer } from 'react-icons/bs';
import { FcKey } from 'react-icons/fc';
import { RiLock2Fill } from 'react-icons/ri';

import { 
  motion, 
  AnimatePresence, 
  LayoutGroup,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { AttentionSeeker } from 'react-awesome-reveal';

export function RevealTrust() {
  // state
  const provider = useProvider();
  const trustCreatorAddress = Networks.getContractAddress(useNetwork().chain.id, 'TrustCreator');
  const { txn } = useParams();
  const [key, setKey] = useState(null);
  const [trust, setTrust] = useState(null);

  // animations
  const lockShadow = useAnimation();
  const textIntro = {
    as: motion.div,
    initial: {
      y: 100,
      opacity: 0,
      scale: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: [0,2,1],
      filter: ['drop-shadow(0 0 0 rgba(255,255,255, 0.0))',
        'drop-shadow(0 0 8px rgba(255,255,255, 0.8))',
        'drop-shadow(0 0 3px rgba(255,255,255, 0.6))']
    }
  };

  // processing
  useEffect(() => {
    setTimeout(() => { 
        (async (transactionHash) => {
          const receipt = await provider.waitForTransaction(txn);
        
          // recover the trust and key information
          setKey(getReceiptEvents(receipt, 'Locksmith', 'keyMinted')
            .filter((e) => e.receiver === trustCreatorAddress)[0]);
          setTrust(getReceiptEvents(receipt, 'Locksmith', 'trustCreated')[0]);

          // trigger the shadow
          lockShadow.start({filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'});
        })();
      }, 5000);
  }, []);

  return (<VStack>
    <AnimatePresence>
      <motion.div initial={{opacity: 0, y: -2000}} animate={{opacity: 1, y: 100}} transition={{type: 'spring'}}>
          <RiLock2Fill size='400px'/>
        <VStack pos='relative' top='-245'>
          <Skeleton isLoaded={trust} fadeDuration={1} width='16em' height='1.5em' borderRadius='lg'>
            <Text as={motion.div} initial={{scale: 0}} animate={{scale: [0, 1.2, 1]}} color='yellow.300' fontSize='32px' fontWeight='bold' 
              fontFamily='Copperplate' pos='relative' top='-3' textAlign='center'>
              {trust && ethers.utils.parseBytes32String(trust.trustName)}
            </Text>
          </Skeleton>
          { (!trust || !key) && <Box as={motion.div} pos='absolute' top="45" 
            animate={{
              opacity: 1,
              rotate: [380, -70, -50, -70, 30],
              transition: {
                repeat: Infinity,
              }
          }}> 
            <BsHammer size='50px'/>
          </Box> } 
          { trust && key && 
            <motion.div 
              whileHover={ trust && key && {scale: 1.1}}
              whileTap={ trust && key && {scale: 0.95}}
              style={{cursor: 'pointer'}} 
              initial={{scale: 0, opacity: 0}}
              animate={{
                rotate: -360,
                scale: 1, 
                opacity: 1,
                filter: ['drop-shadow(0 0 0 rgba(255,200,0, 0.0))','drop-shadow(0 0 50px rgba(255,200,0, 0.5))',
                  'drop-shadow(0 0 15px rgba(255,200,0, 0.5))']
              }}>
              <FcKey size='150px'/><VStack>
              { key && <Text as={motion.div} initial={{opacity: 0, y: 30, scale: 0 }} animate={{opacity: 1, y: 0, scale: [0, 1.2, 1]}}
                pos='relative' top='-108' fontWeight='bold' color='yellow.800'>
                  {ethers.utils.parseBytes32String(key.keyName)}</Text> }</VStack>
            </motion.div> }
          { trust && key && <HStack pos='relative' top='-10' width='270px'>
            <Text {... textIntro } 
              color='gray.200' fontStyle='italic'>Trust #{trust.trustId.toString()}</Text>
            <Spacer/>
            <Text {... textIntro } 
              color='gray.200' fontStyle='italic'>Key #{key.keyId.toString()}</Text> 
          </HStack> }
          { (!key || !trust) && <Text pos='relative' top='-8' color='gray.700' fontStyle='italic'>Minting Key...</Text> }`
        </VStack>
      </motion.div>
    </AnimatePresence>
  </VStack>)
}
