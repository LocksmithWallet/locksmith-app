//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { React, useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
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
import { KeyIcon } from './components/Key';
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
  const navigate = useNavigate();
  const provider = useProvider();
  const trustCreatorAddress = Networks.getContractAddress(useNetwork().chain.id, 'TrustCreator');
  const { txn, trustId, trustName } = useParams();
  const [key, setKey] = useState(null);
  const [trust, setTrust] = useState(trustId && trustName ? {
    trustName: trustName,
    trustId: trustId
  } : null);

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
            .filter((e) => trustId || (e.receiver === trustCreatorAddress))[0]);
          if (!trust) {
            setTrust(getReceiptEvents(receipt, 'Locksmith', 'trustCreated')[0]);
          }

          navigate('/trust/' + (trust || getReceiptEvents(receipt, 'Locksmith', 'trustCreated')[0]).trustId.toString()); 
        })();
      }, 1000);
  }, []);

  return (<VStack ml={{base: 0, md: 72}}>
    <AnimatePresence>
      <motion.div initial={{filter: 'drop-shadow(0 10px 5px rgba(0,0,0,0.5))'}} transition={{type: 'spring'}}>
        <Image src='/gold-lock-large.png'/>
        <VStack pos='relative' top='-245'>
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
          { (!key || !trust) && <Text as={motion.div} animate={{scale: [1, 1.1], transition: {repeat: Infinity, repeatType: 'mirror', duration: 0.5}}}
            pos='relative' top='-10' color='gray.100' fontStyle='italic'>Minting Key...</Text> }
        </VStack>
      </motion.div>
    </AnimatePresence>
  </VStack>)
}
