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
  const provider = useProvider();
  const trustCreatorAddress = Networks.getContractAddress(useNetwork().chain.id, 'TrustCreator');
  const { txn } = useParams();
  const [key, setKey] = useState(null);
  const [trust, setTrust] = useState(null);

  useEffect(() => {
    (async (transactionHash) => {
      const receipt = await provider.waitForTransaction(txn);
     
      // recover the trust and key information
      setKey(getReceiptEvents(receipt, 'Locksmith', 'keyMinted')
        .filter((e) => e.receiver === trustCreatorAddress)[0]);
      setTrust(getReceiptEvents(receipt, 'Locksmith', 'trustCreated')[0]);
    })();
  }, []);

  return (<VStack>
    <AnimatePresence>
      <motion.div initial={{opacity: 0, y: -2000}} animate={{opacity: 1, y: 100}} transition={{type: 'spring'}}>
        <RiLock2Fill size='400px' style={{'filter': 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'}}/> 
        <VStack pos='relative' top='-245'>
          <Skeleton isLoaded={trust} width='16em' height='1.5em' borderRadius='lg'>
            <Text color='yellow.500' fontSize='32px' fontWeight='bold' fontFamily='Copperplate' pos='relative' top='-3' textAlign='center'>
              {trust && ethers.utils.parseBytes32String(trust.trustName)}
            </Text>
          </Skeleton>
          <motion.div 
            initial={{filter: 'drop-shadow(0 0 10px rgba(255,200,0, 0.0))'}}
            animate={{
              filter: ['drop-shadow(0 0 10px rgba(255,200,0, 0.0))','drop-shadow(0 0 18px rgba(255,200,0, 0.5))',
                'drop-shadow(0 0 10px rgba(255,200,0, 0.5))']
            }} transition={{delay: 1}}>
            <FcKey size='150px'/>
          </motion.div>
          { key && <Text pos='relative' top='-113' fontWeight='bold'>
            {ethers.utils.parseBytes32String(key.keyName)}</Text> }
          <HStack pos='relative' top='-10' width='270px'>
            { trust && <Text color='gray.200' fontStyle='italic'>Trust #{trust.trustId.toString()}</Text> }
            <Spacer/>
            { key && <Text color='gray.200' fontStyle='italic'>Key #{key.keyId.toString()}</Text> }
          </HStack>
        </VStack>
      </motion.div>
    </AnimatePresence>
  </VStack>)
}
