import { React, useState } from 'react';
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
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import {
  ClickAnimation,
  badClick,
  quickClick,
  HoverAnimation,
  hoverScaleAnimation 
} from '../components/Animations';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';

export const NetworkSwitcher = () => {
  const network = useNetwork();
  const modalDisclosure = useDisclosure();

  // if we aren't connected, show nothing at all
  if (!(network && network.chain)) {
    return "";
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
  const boxColor = useColorModeValue('gray.100','gray.800');
  const network = useNetwork();
  const [isClosing, setClosing] = useState(false);
  
  const closeModal = function(confirm) {
    setTimeout(() => { setClosing(true); }, confirm ? 300 : 0);
    setTimeout(() => { disclosure.onClose(); setClosing(false);}, confirm ? 600 : 250); 
  }

  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
    onSuccess(data) { closeModal(true); } 
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
                <AttentionSeeker effect='pulse' key={'pulser' + n.id}>
                  <ClickAnimation on={n.id === network.chain.id} onClick={badClick} timeout={300}> 
                  <ClickAnimation on={n.id !== network.chain.id} onClick={quickClick} timeout={300}> 
                    <HoverAnimation on={n.id !== network.chain.id}
                      onEnter={hoverScaleAnimation.onEnter} onLeave={hoverScaleAnimation.onLeave}>
                      <ListItem key={'network-'+n.id} 
                        onClick={() => { if(n.id !== network.chain.id) {switchNetwork?.(n.id);} }}
                        border='1px' 
                        borderColor='gray.300'
                        bgColor={boxColor} 
                        boxShadow='md' borderRadius='full' padding='0.5em' 
                        cursor='pointer'>
                        <HStack spacing='1em' pr='1em'>
                          { isLoading && pendingChainId === n.id ? <Spinner size='lg'/> : n.icon({size: 32}) }
                          <Text>{ n.label }</Text>
                          <Spacer/>
                          { network && network.chain && network.chain.id === n.id && 
                            <Text fontSize='sm' color="gray" fontStyle='italic'>Connected</Text> }
                        </HStack>
                      </ListItem>
                    </HoverAnimation>
                  </ClickAnimation>
                  </ClickAnimation>
                </AttentionSeeker>
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
