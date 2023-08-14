//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { useNavigate } from 'react-router-dom';
import { React, useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Input,
  Text,
  Spinner,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';
import { Networks } from './configuration/Networks';
import { ConnectKitButton } from "connectkit";
import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';

import { 
  motion, 
  AnimatePresence, 
  LayoutGroup,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { AttentionSeeker } from 'react-awesome-reveal';
import { BiLink } from 'react-icons/bi';

import { TransactionListContext } from './components/TransactionProvider';
import { useMintTrust } from './hooks/contracts/TrustCreator.jsx';
import { Onboard } from './Onboard';

export function Home() {
  return (<Onboard/>);
}
