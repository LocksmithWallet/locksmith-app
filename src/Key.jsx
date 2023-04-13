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

// animations
import { 
  motion, 
  AnimatePresence
} from 'framer-motion';

export function Key() {
  // state

  // animations

  // processing

  return (
    <Text>Hi</Text>
  )
}
