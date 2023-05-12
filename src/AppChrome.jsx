// React and UI
import React, { 
  ReactNode, 
  ReactText,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import { Networks } from './configuration/Networks';
import {Link, useNavigate } from 'react-router-dom';

// Navigation components
import { NetworkSwitcher } from './navigation/NetworkSwitcher';
import { WalletConnector } from "./navigation/WalletConnector";
import { KeyNavigator } from './navigation/KeyNavigator';
import { TransactionHistoryButton } from './navigation/TransactionHistory';
import { SupportedNetworkCheck } from './components/SupportedNetworkCheck';

// Animations
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { AttentionSeeker } from 'react-awesome-reveal';

// Icons
import { FiMenu } from 'react-icons/fi';
import { BiCoinStack } from 'react-icons/bi';
import { HiOutlineKey } from 'react-icons/hi';

export default function SidebarWithHeader({children}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return <Box minH="100vh" bg={useColorModeValue('gray.200', 'gray.900')} style={{'overflow': 'hidden'}}>
    <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }}/>
    <Drawer autoFocus={false} isOpen={isOpen} placement="left" onClose={onClose}
      returnFocusOnClose={false} onOverlayClick={onClose} size="full">
      <DrawerContent>
        <SidebarContent onClose={onClose}/>
      </DrawerContent>
    </Drawer>
    {/* mobilenav */}
    <MobileNav onOpen={onOpen}/>
    <Box ml={{ base: 0, md: 0}}> 
      <SupportedNetworkCheck>
        {children}
      </SupportedNetworkCheck>
    </Box>
  </Box>
}

const SidebarContent = ({onClose, ...rest }) => {
  const network = useNetwork(); 
  const navigate = useNavigate();
  const ref = useRef();
  const [zIndex, setZIndex] = useState(0);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const elements = document.elementsFromPoint(clientX, clientY);
    const targetElement = elements.find(
      (element) => ref.current && ref.current.contains(element)
    );

    if (targetElement) {
      const blurry = elements.find(
        (element) => element.getAttribute('data-blurry') === 'blurry'
      );
      if (blurry) {return;}

      // Hover is over the target element
      setZIndex(9);
    } else {
      // Hover is not over the target element
      setZIndex(0);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Box
      ref={ref}
      zIndex={zIndex}
      onMouseEnter={() => {setZIndex(3);}}
      onMouseLeave={() => {setZIndex(0);}}
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 72}}
      pos="fixed"
      overflowY='scroll'
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <HStack onClick={() => { onClose(); navigate('/');}} spacing={0} cursor='pointer'>
          <motion.div  initial={{x: -100}} animate={{x: 0}} transition={{duration: 0.5}}>
            <Heading fontSize='4xl'>L</Heading>
          </motion.div>
          <AttentionSeeker effect='bounce'>
            <Image style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} src='/gold-lock-tiny.png'/>
          </AttentionSeeker>
          <motion.div  initial={{x: 100}} animate={{x: 0}} transition={{duration: 0.5}}>
            <Heading fontSize="4xl" data-text="cksmith">
              cksmith
            </Heading>
          </motion.div>
        </HStack>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose}/>
      </Flex>
      { network && network.chain && network.chain.id && 
          Networks.getNetwork(network.chain.id) && <KeyNavigator onClose={onClose}/> }
    </Box>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const network = useNetwork();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <motion.div
        initial={{opacity: 0, y: -100}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: -100}}
        transition={{type: 'spring'}}>
        <IconButton
          size='sm'
          boxShadow='lg'
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          aria-label="open menu"
          icon={<FiMenu />}/>
      </motion.div>
      <Flex alignItems={'center'}>
        <HStack spacing='0.9em'>
          <LayoutGroup>
            { network && network.chain && <motion.div layout
              key='transaction-history-chrome'
              initial={{opacity: 0, y: -100}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -100}}
              transition={{
                layout: {type: 'spring'},
                type: 'spring'
              }}>
              <TransactionHistoryButton/>
            </motion.div> }
            <motion.div layout 
              key='wallet-connector-chrome'
              initial={{opacity: 0, y: -100}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -100}}
              transition={{
                layout: {type: 'spring'},
                type: 'spring'}}>
              <WalletConnector/>
            </motion.div>
            <AnimatePresence>
            { network && network.chain && (
              <motion.div
                key='network-switcher-chrome'
                initial={{opacity: 0, y: -100}}
                animate={{opacity: 1, y: 0}}
                transition={{ type: 'spring'}}>
                  <NetworkSwitcher/> 
              </motion.div>)}
            </AnimatePresence>
          </LayoutGroup>
        </HStack>
      </Flex>
    </Flex>
  );
};
