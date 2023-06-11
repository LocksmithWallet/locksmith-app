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

import { motion } from 'framer-motion';

export function Trust() {
  const { trustId } = useParams();

  return (<motion.div key={"trust-"+trustId}>
    <Box ml={{base: 0, md: 72}}>
      <Text>Hello Trust {trustId}</Text>
    </Box>
  </motion.div>) 
}
