import React from 'react';
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
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import { useNetwork } from 'wagmi';
import { Networks } from '../configuration/Networks';
import { FaMoon, FaSun } from 'react-icons/fa';

export const NetworkSwitcher = () => {
  const network = useNetwork();
  const modalDisclosure = useDisclosure();

  return network && network.chain ? ( <>
    <Button onClick={modalDisclosure.onOpen} 
      size='sm' leftIcon={Networks.getNetwork(network.chain.id).icon({size: 16})}>
      { Networks.getNetwork(network.chain.id).label }
    </Button>
    <NetworkDialog disclosure={modalDisclosure}/>
  </> ) : <></> ;
};

const NetworkDialog = ({disclosure, ...rest}) => {
  const boxColor = useColorModeValue('gray.100','gray.800');
  return (
    <Modal size='xl' onClose={disclosure.onClose} isOpen={disclosure.isOpen} isCentered motionPreset='slideInRight'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Choose Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <List spacing='1em'>
            <Fade duration='300' cascade>
              { Networks.getSupportedNetworks().map((n) => (
                <AttentionSeeker effect='pulse' key={'pulser' + n.id}>
                  <ListItem key={'network-'+n.id} 
                    border='1px' borderColor='gray.400' bgColor={boxColor} 
                    boxShadow='md' borderRadius='full' padding='0.5em' 
                    _hover={{transform: 'scale(1.05)'}}
                    cursor='pointer'>
                    <HStack spacing='1em'>
                      { n.icon({size: 32}) }
                      <Text>{ n.label }</Text>
                      <Spacer/>
                      <Text fontSize='sm' color="gray" fontStyle='italic'>#{ n.id}</Text>
                    </HStack>
                  </ListItem>
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
