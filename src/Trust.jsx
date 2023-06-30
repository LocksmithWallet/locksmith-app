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
  Tag,
  TagLabel,
  TagLeftIcon,
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

import { useTrustInfo } from './hooks/contracts/Locksmith';

import { motion } from 'framer-motion';
import { AiOutlineNumber } from 'react-icons/ai';

export function Trust() {
  const { trustId } = useParams();
  const trustInfo = useTrustInfo(trustId);

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}} pos='relative'>
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
    </Box>
  </motion.div>) 
}
