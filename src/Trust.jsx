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
  List,
  ListItem,
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

import {
  useKeyHolders,
  useTrustInfo,
  useTrustKeys,
  useInspectKey,
} from './hooks/contracts/Locksmith';
import {
  TRUST_CONTEXT,
  KEY_CONTEXT,
} from './hooks/contracts/Ledger';

import { ContextBalanceUSD } from './components/Ledger';
import { KeyIcon } from './components/Key';

import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineNumber } from 'react-icons/ai';

export function Trust() {
  const { trustId } = useParams();
  const trustInfo = useTrustInfo(trustId);
  const trustKeys = useTrustKeys(trustId);

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}} pos='relative'>
      <TrustHeader trustId={trustId} trustInfo={trustInfo}/>
      <TrustBalanceBox trustId={trustId}/>
      { trustInfo && trustKeys.isSuccess &&
        <TrustKeyList
          trustId={trustId}
          trustInfo={trustInfo}
          trustKeys={trustKeys.data}/> }
    </Box>
  </motion.div>) 
}

const TrustBalanceBox = ({trustId, ...rest}) => {
  return (<Box m='1em' mt='2em' bg='white' borderRadius='lg' boxShadow='lg' p='0.8em'>
    <VStack>
      <ContextBalanceUSD contextId={TRUST_CONTEXT} identifier={trustId}
        skeletonProps={{}}
        textProps={{
          fontSize: '2xl',
          fontWeight: 'bold'
        }}/>
    </VStack>
  </Box>)
}

const TrustHeader = ({trustId, trustInfo, ...rest}) => {
  return (<>
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
  </>)
}

const TrustKeyList = ({trustId, trustInfo, trustKeys, ...rest}) => {
  return (<List spacing='1.8em' m='1em' mt='2em'>
    <AnimatePresence>
      { trustKeys.map((k,x) => <ListItem key={'tkli-'+k.toString()} as={motion.div}
        initial={{x: '100vh'}}
        animate={{x: 0, transition: {delay: 0.125 + 0.05*x}}}
        exit={{x: '100vh'}}>
          <TrustKeyListItem keyId={k}/>
      </ListItem>) }
    </AnimatePresence>
  </List>)
}

const TrustKeyListItem = ({keyId, ...rest}) => {
  const keyInfo = useInspectKey(keyId);

  return (<Box bg='white' borderRadius='lg' boxShadow='lg' p='0.8em' overflow='hidden' pos='relative'>
    {keyInfo &&
      <motion.div key={'kmo'+keyId} initial={{x: '100vw'}} animate={{x: 0}} transition={{duration: 0.2, delay: 0.3}}> 
        <KeyIcon keyInfo={keyInfo} size='80px' 
          style={{
            filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))',
            opacity: 0.5,
            position: 'absolute',
            left: '-16px',
            top: '-20px'
          }
        }/>
        <VStack pos='absolute' width='3em' top='2px'>
          <Text fontSize='xs'>#{keyId.toString()}</Text>
        </VStack>
      </motion.div> }
    <HStack pl='4em'>
      <Text fontWeight='bold'>{keyInfo && keyInfo.alias}</Text>
      <Spacer/>
      <ContextBalanceUSD contextId={KEY_CONTEXT} identifier={keyId}
        skeletonProps={{}}
        textProps={{
          fontSize: 'md',
        }}/>
    </HStack>
  </Box>)
}
