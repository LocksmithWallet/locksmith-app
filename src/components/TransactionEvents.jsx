import {
  Box,
  HStack,
  Image,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useInspectKey } from '../hooks/contracts/Locksmith';

import { KeyIcon } from './Key';
import {
  FcCancel,
  FcFlashOn,
  FcSafe,
  FcRules,
  FcPlus
} from 'react-icons/fc';

export const TransferSingleEvent = ({event}) => {
  // check to make sure its not a mint event, because the key minted event will cover it
  if (event.topics.from === ethers.constants.AddressZero) {
    return '';
  }

  return <Text>Le Transfer Key</Text> 
}

export const KeyMintedEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.keyId);
  const keyAlias = ethers.utils.parseBytes32String(event.topics.keyName);
  return (<HStack pos='relative'>
    { keyInfo ? <KeyIcon keyInfo={keyInfo} size='32px'/> : <Skeleton width='2em' height='2.5em'/> }
    { keyInfo && <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box> }
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Key Minted</Text>
      <Text fontStyle='italic' textColor='gray.500'>#{event.topics.keyId.toString()}: {keyAlias}</Text>
    </VStack>
  </HStack>)
}

export const TrustCreatedEvent = ({event}) => {
  const trustAlias = ethers.utils.parseBytes32String(event.topics.trustName);
  return (<HStack pos='relative'>
    <Image src='/gold-lock-small.png' width='24px' ml='0.3em' mr='0.3em'/>
    <Box pos='absolute' left='10px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Trust Created</Text>
      <Text fontStyle='italic' textColor='gray.500'>#{event.topics.trustId.toString()}: {trustAlias}</Text>
    </VStack>
  </HStack>)
}

export const TrustedRoleChangeEvent = ({event}) => {
  const role = parseInt(event.topics.role.toString());
  const RoleIcon = [
      FcSafe,   // Collateral Provider
      FcRules,  // Scribe
      FcFlashOn // Dispatcher
  ][role];

  return (<HStack pos='relative'>
    <RoleIcon size='32px'/>
    { event.topics.trustLevel && <Box pos='absolute' left='10px' top='20px'><FcPlus size='16px'/></Box> }
    { !event.topics.trustLevel && <Box pos='absolute' left='4px' top='10px'><FcCancel size='26px'/></Box> }
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Vault {event.topics.trustLevel ? 'Added' : 'Removed'}</Text>

    </VStack>
  </HStack>)
}

export const DefaultTransactionEvent = ({event}) => {
  return <Text>{event.name}</Text>
}
