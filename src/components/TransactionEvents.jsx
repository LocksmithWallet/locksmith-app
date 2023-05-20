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
import { useTrustedActorAlias } from '../hooks/contracts/Notary';

import { motion } from 'framer-motion';
import { DisplayAddress, AddressAlias } from './Address';
import { KeyIcon } from './Key';
import {
  FcCancel,
  FcFlashOn,
  FcAdvance,
  FcLink,
  FcSafe,
  FcRules,
  FcPlus
} from 'react-icons/fc';

export const TransferSingleEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.id);

  // see if we can name the destination in some way

  // check to make sure its not a mint event, because the key minted event will cover it
  if (event.topics.from === ethers.constants.AddressZero) {
    return '';
  }

  return (<HStack pos='relative'>
    <Skeleton isLoaded={keyInfo} width='2em' height='2.5em'>
      {keyInfo && <KeyIcon keyInfo={keyInfo} size='32px'/> }
      <Box pos='absolute' left='8px' top='10px'><FcAdvance size='24px'/></Box>
    </Skeleton>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      {keyInfo && <Text fontWeight='bold'>'{keyInfo.alias}' sent</Text> }
      <Text fontStyle='italic' color='gray.500'><AddressAlias address={event.topics.from}/> to <AddressAlias address={event.topics.to}/></Text>
    </VStack>
  </HStack>)
}

export const KeyMintedEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.keyId);
  const keyAlias = ethers.utils.parseBytes32String(event.topics.keyName);
  return (<HStack pos='relative'>
    { keyInfo ? <KeyIcon keyInfo={keyInfo} size='32px'/> : <Skeleton width='2em' height='2.5em'/> }
    { keyInfo && <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box> }
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Minted '{keyAlias}'</Text>
      <Text fontStyle='italic' textColor='gray.500'>Sent to <AddressAlias address={event.topics.receiver}/></Text>
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
  const actorAlias = useTrustedActorAlias(
    event.topics.trustId,
    event.topics.role,
    event.topics.actor,
    event.topics.ledger);
  const role = parseInt(event.topics.role.toString());
  const RoleIcon = [
      FcSafe,   // Collateral Provider
      FcRules,  // Scribe
      FcFlashOn // Dispatcher
  ][role];
  const RoleName = [
    'Vault', 
    'Scribe', 
    'Dispatcher'
  ][role];

  return (<HStack pos='relative'>
    <RoleIcon size='32px'/>
    { event.topics.trustLevel && <Box pos='absolute' left='10px' top='20px'><FcPlus size='16px'/></Box> }
    { !event.topics.trustLevel && <Box pos='absolute' left='4px' top='10px'><FcCancel size='26px'/></Box> }
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{RoleName} {event.topics.trustLevel ? 'Added' : 'Removed'}</Text>
      { actorAlias.isSuccess && 
        <Text fontStyle='italic' textColor='gray.500'>{ethers.utils.parseBytes32String(actorAlias.data)}</Text> }
    </VStack>
  </HStack>)
}

export const SetSoulboundKeyAmountEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.keyId);
  
  return (<HStack pos='relative'>
    { keyInfo ?  <KeyIcon keyInfo={keyInfo} size='32px'/> : <Skeleton width='2em' height='2.5em'/> }
    { keyInfo && <Box pos='absolute' left='4px' top='16px'><FcLink size='20px'/></Box> }
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Bind '{keyInfo.alias}'</Text>
      <Text fontStyle='italic' textColor='gray.500'><AddressAlias address={event.topics.keyHolder}/> must maintain <b>{event.topics.amount.toString()}</b> copies</Text>
    </VStack>
  </HStack>)
}

export const InitializedEvent = ({event}) => {}
export const UpgradedEvent = ({event}) => {}
export const DefaultTransactionEvent = ({event}) => {
  return <Text>{event.name}</Text>
}
