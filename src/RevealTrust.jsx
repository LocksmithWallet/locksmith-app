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
  Input,
  Text,
  Spacer,
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
      <motion.div initial={{filter: 'drop-shadow(0 10px 5px rgba(0,0,0,0.5))'}} transition={{type: 'spring'}}>
        <Image src='/gold-lock-large.png'/>
        <VStack pos='relative' top='-245'>
          { trust &&  
            <Text as={motion.div} initial={{scale: 0}} animate={{scale: [0, 1.2, 1]}} color='yellow.300' fontSize='32px' fontWeight='bold' 
              fontFamily='Copperplate' pos='relative' top='-3' textAlign='center'>
              {trust && ethers.utils.parseBytes32String(trust.trustName)}
            </Text> }
          { (!trust || !key) && <Box as={motion.div}
            style={{
              y: 57
            }}
            animate={{
              opacity: 1,
              rotate: [380, -70, -50, -70, 30],
              transition: {
                repeat: Infinity,
              }
          }}> 
            <BsHammer size='38px' color='#EFEFEF'/>
          </Box> } 
          { trust && key && 
            <motion.div 
              whileHover={ trust && key && {scale: 1.1}}
              whileTap={ trust && key && {scale: 0.95}}
              style={{cursor: 'pointer', y: -30}} 
              initial={{scale: 0, opacity: 0}}
              animate={{
                rotate: -360,
                scale: 1, 
                opacity: 1,
                filter: ['drop-shadow(0 0 0 rgba(255,200,0, 0.0))','drop-shadow(0 0 50px rgba(255,255,0, 0.9))',
                  'drop-shadow(0 0 15px rgba(255,215,0, 0.6))']
              }}>
              <FcKey size='150px'/><VStack>
              { key && <Text as={motion.div} initial={{opacity: 0, y: 30, scale: 0 }} animate={{opacity: 1, y: 0, scale: [0, 1.2, 1]}}
                pos='relative' top='-108' fontWeight='bold' color='yellow.800'>
                  {ethers.utils.parseBytes32String(key.keyName)}</Text> }</VStack>
            </motion.div> }
          { trust && key && <div style={{position: 'relative', top: -120}}><HStack width='220px'>
            <Text {... textIntro } 
              color='gray.200' fontStyle='italic'>Trust #{trust.trustId.toString()}</Text>
            <Spacer/>
            <Text {... textIntro } 
              color='gray.200' fontStyle='italic'>Key #{key.keyId.toString()}</Text> 
          </HStack></div> }
          { (!key || !trust) && <Text as={motion.div} animate={{scale: [1, 1.1], transition: {repeat: Infinity, repeatType: 'mirror', duration: 0.5}}}
            pos='relative' top='-10' color='gray.100' fontStyle='italic'>Minting Key...</Text> }
        </VStack>
      </motion.div>
    </AnimatePresence>
  </VStack>)
}
