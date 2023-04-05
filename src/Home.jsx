//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import React from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import { RiLock2Fill } from 'react-icons/ri';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import { BiLink } from 'react-icons/bi';

export function Home() {
  const account = useAccount();
  return (<VStack>
    <HStack spacing='0' mt='1em'>
      <Fade direction='left'><Heading fontSize='6xl'>L</Heading></Fade>
      <Fade direction='down'><RiLock2Fill size='52px'/></Fade>
      <Fade direction='right'><Heading fontSize={'6xl'}>cksmith</Heading></Fade>
    </HStack>
    <Fade direction='up'>
      <Text color={'gray.600'} fontSize={'xl'}>
        Turn your wallet into a bank.
      </Text>
    </Fade>
    <Box pt='3em'>
      <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return <AnimatePresence>{!isConnected ? (<motion.div
          layoutId='home-button'
          initial={{opacity: 0, scale: 0}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.5}}>
          <AttentionSeeker effect='tada' delay={450}>
          <Button
            as={motion.button}
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.95, y: 10}}
            onClick={show}
            colorScheme='blue'
            size='lg'
            border='1px' borderColor='blue.500'
            boxShadow='dark-lg'
            leftIcon={<BiLink/>}>Connect</Button>
          </AttentionSeeker>
        </motion.div>) : ''}</AnimatePresence>
        }}
      </ConnectKitButton.Custom>
    </Box>
  </VStack>)
}
