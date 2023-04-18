import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  List,
  ListItem,
  Text,
  Spacer,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import { ChakraBox, HeadShakeMotion } from '../components/Animations';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';

export const NetworkSwitcher = () => {
  const network = useNetwork();
  const modalDisclosure = useDisclosure();
  const [icon, setIcon] = useState(null);
  const [label, setLabel] = useState(null);
  
  useEffect(() => {
    if (network && network.chain) {
      const config = Networks.getNetwork(network.chain.id);
      if(config) {
        setIcon(config.icon({size: 16}));
        setLabel(config.label);
      }
    }
  }, [network.chain]);

  // if we aren't connected, show nothing at all
  if (!(network && network.chain)) {
    return <Button boxShadow='lg'
      size='sm' leftIcon={icon}>{label}</Button>
  }

  const networkConfiguration = Networks.getNetwork(network.chain.id);
  return ( <>
    <Button onClick={modalDisclosure.onOpen} boxShadow='lg' 
      size='sm' leftIcon={networkConfiguration ? networkConfiguration.icon({size: 16}) : <FiAlertCircle size='16'/>}>
      { networkConfiguration ? networkConfiguration.label : 'Unsupported'}
    </Button>
    <NetworkDialog disclosure={modalDisclosure}/>
  </> ) 
};

const NetworkDialog = ({disclosure, ...rest}) => {
  const network = useNetwork();
  const navigate = useNavigate();
  const [isClosing, setClosing] = useState(false);
  
  const closeModal = function(confirm) {
    setTimeout(() => { setClosing(true); }, confirm ? 300 : 0);
    setTimeout(() => { setClosing(false); disclosure.onClose(); }, confirm ? 600 : 250); 
  }

  const switcher = useSwitchNetwork({
    onSuccess(data) { 
      closeModal(true); 
      navigate('/');
    } 
  });

  return (
    <Modal size='xl' onClose={closeModal} isOpen={disclosure.isOpen} isCentered motionPreset='scale'>
      <Fade {... isClosing ? {reverse: true} : {}}  duration='800'>
        <ModalOverlay backdropFilter='blur(10px)'/>
      </Fade>
      <ModalContent>
        <ModalHeader>Choose Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <List spacing='1em'>
            <Fade direction={isClosing ? 'up' : 'down'} {... isClosing ? {reverse: true} : {}}  duration='300' cascade>
              { Networks.getSupportedNetworks().map((n) => (
                <NetworkListItem key={'nli'+n.id} network={n} isConnected={network && network.chain && network.chain.id === n.id}
                  switcher={switcher}/>
              )) }
            </Fade>
          </List>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const NetworkListItem = ({network, isConnected, switcher, ...rest}) => {
  const boxColor = useColorModeValue('gray.100','gray.800');
  const controls = useAnimationControls();
  return (<ChakraBox animate={controls}>
    <AttentionSeeker effect='pulse'>
    <ListItem key={'network-'+network.id}
      as={motion.div}
      whileTap={ !isConnected ? {scale: 0.95} : {} }
      onClick={() => { 
        if(!isConnected) {
          switcher.switchNetwork?.(network.id);
        } else {
          controls.start(HeadShakeMotion);
        }
      }}
      border='1px'
      borderColor='gray.300'
      bgColor={boxColor}
      boxShadow='md' borderRadius='full' padding='0.5em'
      cursor='pointer'>
        <HStack spacing='1em' pr='1em'>
          { switcher.isLoading && switcher.pendingChainId === network.id ? 
            <Spinner size='lg'/> : network.icon({size: 32}) }
          <Text>{ network.label }</Text>
          <Spacer/>
          <AnimatePresence>
            { isConnected &&
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, ease: 'linear'}}>
              <Text
                fontSize='sm' color="gray" fontStyle='italic'>Connected</Text>
              </motion.div>
            }
          </AnimatePresence>
        </HStack>
    </ListItem>
    </AttentionSeeker>
  </ChakraBox>)
}
