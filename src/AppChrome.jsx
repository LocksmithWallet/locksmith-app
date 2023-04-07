// React and UI
import React, { 
  ReactNode, 
  ReactText,
  useState
} from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import {Link, useNavigate } from 'react-router-dom';
// Navigation components
import { NetworkSwitcher } from './navigation/NetworkSwitcher';
import { WalletConnector } from "./navigation/WalletConnector";

// Animations
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { AttentionSeeker, Fade } from 'react-awesome-reveal';

// Icons
import { FiMenu } from 'react-icons/fi';
import { BiCoinStack } from 'react-icons/bi';
import { HiOutlineKey } from 'react-icons/hi';
import { RiLock2Fill } from 'react-icons/ri';

const LinkItems = [
  { name: 'Keys', icon: HiOutlineKey, href: '/keys'},
  { name: 'Assets', icon: BiCoinStack, href: '/assets'}
];

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
    <Box ml={{ base: 0, md: 60 }}> 
      {children}
    </Box>
  </Box>
}

const SidebarContent = ({ onClose, ...rest }) => {
  const navigate = useNavigate();
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <HStack onClick={() => {navigate('/');}} spacing={0} cursor='pointer'>
          <Fade direction='left'>
            <Text fontSize='2xl'><b>L</b></Text>
          </Fade>
          <Fade direction='down'> 
            <RiLock2Fill size='22px'/>
          </Fade>
          <Fade direction='right'>
            <Text fontSize='2xl'><b>cksmith</b></Text>
          </Fade>
        </HStack>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose}/>
      </Flex>
      { LinkItems.map((link) => (
        <NavItem onClick={onClose} mt='0.4em' href={link.href} key={link.name} icon={link.icon} fontSize='lg'>
          {link.name}
        </NavItem>
      )) }
    </Box>
  );
};

const NavItem = ({ href, icon, children, ...rest }) => {
  return (
    <Link to={href} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: useColorModeValue('gray.500','gray.700'),
          color: 'white',
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize='1.4em'
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
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
        <HStack spacing='1em'>
          <LayoutGroup>
            <motion.div layout 
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
