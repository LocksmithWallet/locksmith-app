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
import { RiLock2Fill } from 'react-icons/ri';

import { Fade } from 'react-awesome-reveal';

export function Home() {
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
  </VStack>)
}
