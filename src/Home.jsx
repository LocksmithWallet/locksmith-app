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
  useColorModeValue,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import { FcKey } from 'react-icons/fc';
import { RiLock2Fill } from 'react-icons/ri';

import { 
  motion, 
  AnimatePresence, 
  LayoutGroup,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import { BiLink } from 'react-icons/bi';

export function Home() {
  const account = useAccount();
  return (<VStack>
    <HStack spacing='0' mt='1em'>
      <Fade direction='left' duration='500'><Heading fontSize='6xl'>L</Heading></Fade>
      <Fade>
        <AttentionSeeker effect='bounce'>
        <RiLock2Fill size='52px'/>
        </AttentionSeeker>
      </Fade>
      <Fade direction='right' duration='500'><Heading fontSize={'6xl'}>cksmith</Heading></Fade>
    </HStack>
    <Fade direction='up' duration='500'>
      <Text color={'gray.600'} fontSize={'xl'}>
        Turn your wallet into a bank.
      </Text>
    </Fade>
    <Box pt='3em'>
      <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return <AnimatePresence>{!isConnected ? (<motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0, transition: {delay: 0}}}
          transition={{duration: 0.5, delay: 0.5}}>
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
        </motion.div>) : <CreateAccount/> }</AnimatePresence>
        }}
      </ConnectKitButton.Custom>
    </Box>
  </VStack>)
}

const CreateAccount = ({}) => {
  return <motion.div>
    <CreateAccountKey delay={0}/>
    <CreateAccountKey delay={1}/>
    <CreateAccountKey delay={2}/>
    <CreateAccountKey delay={3}/>
    <CreateAccountKey delay={4}/>
    <CreateAccountKey delay={5}/>
    <CreateAccountKey delay={6}/>
    <CreateAccountKey delay={7}/>
  </motion.div>
}

const CreateAccountKey = ({delay, ... rest}) => {
  const x = useMotionValue(-220);
  const rotateY = useTransform(x, [-220, 150], [90, -90])
  const opacity = useTransform(x, [-220, -60, 150], [0, 1, 0]);
  const scale = useTransform(x, [-220, -60, -150], [0.5, 1.4, 0.5]);
  return <motion.div 
      style={{
      display: 'inline-block',
      width: 60,
      height: 60,
      x: x,
      scale: scale,
      position: 'absolute', 
      rotateY: rotateY,
      opacity: opacity,
      cursor: 'grab'
    }}
    animate={{
      x: 150, 
      transition: {
        duration: 8,
        repeat: Infinity,
        delay: delay
      },
    }}
    whileTap={{ cursor: 'grabbing'}}>
      <FcKey size='60px'/>
  </motion.div>
}
