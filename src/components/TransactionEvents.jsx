import {
  Box,
  HStack,
  Image,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { Networks } from '../configuration/Networks';
import { useInspectKey } from '../hooks/contracts/Locksmith';
import { useTrustedActorAlias } from '../hooks/contracts/Notary';
import { useRecoveryPolicy } from '../hooks/contracts/TrustRecoveryCenter';
import { useEventInfo } from '../hooks/contracts/TrustEventLog';

import { motion } from 'framer-motion';
import { DisplayAddress, AddressAlias } from './Address';
import { KeyIcon } from './Key';
import {
  FcApproval,
  FcAlarmClock,
  FcCancel,
  FcDownload,
  FcFlashOn,
  FcAdvance,
  FcFilingCabinet,
  FcLink,
  FcSafe,
  FcShare,
  FcRules,
  FcPlus,
  FcQuestions,
  FcOvertime,
  FcMoneyTransfer,
  FcCustomerSupport,
  FcRight,
  FcLeft,
  FcMultipleInputs,
} from 'react-icons/fc';
import { ImQrcode, ImMinus } from 'react-icons/im';
import { MdHealthAndSafety } from 'react-icons/md';

export const TransferSingleEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.id);

  // see if we can name the destination in some way

  // check to make sure its not a mint or burn event, because the key minted event will cover it
  if (event.topics.from === ethers.constants.AddressZero ||
    event.topics.to === ethers.constants.AddressZero) {
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
      <Text fontWeight='bold'>Bind {keyInfo ? "'" + keyInfo.alias + "'" : 'Key'}</Text>
      <Text fontStyle='italic' textColor='gray.500'><AddressAlias address={event.topics.keyHolder}/> must maintain <b>{event.topics.amount.toString()}</b> copies</Text>
    </VStack>
  </HStack>)
}

export const KeyAddressRegistrationEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.inboxKey);

  return (<HStack pos='relative'>
    <Box ml='0.3em'><ImQrcode size='24px'/></Box>
    <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Wallet Created{keyInfo ? " for '" + keyInfo.alias + "'" : ''}</Text>
      <Text fontStyle='italic' textColor='gray.500'><DisplayAddress address={event.topics.inbox}/></Text>
    </VStack>
  </HStack>)
}

export const NotaryDistributionApprovalEvent = ({event}) => {
  return (<HStack pos='relative'>
    <FcRules size='24px'/>
    <Box pos='absolute' left='4px' top='16px'><FcApproval size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'><AddressAlias address={event.topics.scribe}/> Approval</Text>
      <Text fontStyle='italic' textColor='gray.500'>Funds in <AddressAlias address={event.topics.provider}/></Text>
    </VStack>
  </HStack>)
}

export const NotaryWithdrawalApprovalEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);

  return (<HStack pos='relative'>
    <FcRules size='24px'/>
    <Box pos='absolute' left='4px' top='16px'><FcApproval size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Withdrawal Approved</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        {ethers.utils.formatUnits(event.topics.amount, asset.decimals)} {asset.symbol} from <AddressAlias address={event.topics.provider}/> 
      </Text>
    </VStack>
  </HStack>)
}

export const NotaryDepositApprovalEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);

  return (<HStack pos='relative'>
    <FcRules size='24px'/>
    <Box pos='absolute' left='4px' top='16px'><FcApproval size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Deposit Approved</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        {ethers.utils.formatUnits(event.topics.amount, asset.decimals)} {asset.symbol} to <AddressAlias address={event.topics.provider}/>
      </Text>
    </VStack>
  </HStack>)
}

export const LedgerTransferOccurredEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);
  const fromKeyInfo = useInspectKey(event.topics.rootKeyId);
  const toKeyInfo = useInspectKey(event.topics.keys[0]);

  return (<HStack pos='relative'>
    <FcShare size='24px'/>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Transfer {ethers.utils.formatUnits(event.topics.amounts.reduce((memo, next, i) => { return memo.add(next);}, BigNumber.from(0)), asset.decimals)} {asset.symbol}</Text>
      { event.topics.keys.length < 2 &&  <Text fontStyle='italic' textColor='gray.500'>
        From {fromKeyInfo ? fromKeyInfo.alias : 'a key'} to {toKeyInfo ? toKeyInfo.alias : 'another key'}
      </Text> }
      { event.topics.keys.length >= 2 &&  <Text fontStyle='italic' textColor='gray.500'>
          From {fromKeyInfo ? fromKeyInfo.alias : 'a key'} across {event.topics.keys.length} keys 
      </Text> }
    </VStack>
  </HStack>)
}

export const WithdrawalAllowanceAssignedEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);
  const key = useInspectKey(event.topics.keyId);
  
  return (<HStack pos='relative'>
    <FcSafe size='28px'/>
    <Box pos='absolute' left='6px' top='16px'><FcApproval size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'><AddressAlias address={event.topics.provider}/> Allowance</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        Set to {ethers.utils.formatUnits(event.topics.amount, asset.decimals)} {asset.symbol} for {key ? key.alias : 'a key'}
      </Text>
    </VStack>
  </HStack>)
}

export const WithdrawalOccurredEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);
  const key = useInspectKey(event.topics.keyId);
  return (<HStack pos='relative'>
    {asset.icon({size: '28px'})}
    <Box pos='absolute' left='6px' top='20px'><ImMinus size='16px' color='#FF6666'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{ethers.utils.formatUnits(event.topics.amount, asset.decimals)} {asset.symbol} Withdrawn</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        From {key ? key.alias : 'a key'} in <AddressAlias address={event.topics.provider}/> 
      </Text>
    </VStack>
  </HStack>)
}

export const DepositOccurredEvent = ({event}) => {
 const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);
  const key = useInspectKey(event.topics.keyId);
  return (<HStack pos='relative'>
    {asset.icon({size: '28px'})}
    <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{ethers.utils.formatUnits(event.topics.amount, asset.decimals)} {asset.symbol} Deposited</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        To {key ? key.alias : 'a key'} in <AddressAlias address={event.topics.provider}/>
      </Text>
    </VStack>
  </HStack>)
}

export const AddressTransactionEvent = ({event}) => {
  const network = useNetwork();
  const asset = Networks.getAsset(network.chain.id, event.topics.arn);
  const key = useInspectKey(event.topics.keyId);

  const TransactionIcon = [
    FcQuestions,
    FcMoneyTransfer,
    FcMoneyTransfer,
    FcMultipleInputs
  ][event.topics.txType];

  const TransactionSubIcon = [
    null,
    FcRight,
    FcLeft,
    null
  ][event.topics.txType];

  const eventTitle = [
    'Invalid',
    (key ? key.alias : 'A key') + ' sent ' + ethers.utils.formatUnits(event.topics.amount, asset.decimals) + " " + asset.symbol,
    (key ? key.alias : 'A key') + ' received ' + ethers.utils.formatUnits(event.topics.amount, asset.decimals) + " " + asset.symbol,
    'Multi-call Transaction'
  ][event.topics.txType];

  const eventDescription = [
    'Invalid',
    'To ',
    'From ',
    'See Explorer',
  ][event.topics.txType];

  const eventActor = [
    'Invalid',
    event.topics.target,
    event.topics.operator,
    event.topics.target,
  ][event.topics.txType];

  return (<HStack pos='relative'>
    <TransactionIcon size='28px'/>
    <Box position='absolute' left='-6px' top='12px'><TransactionSubIcon size='24px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{eventTitle}</Text>
      <Text fontStyle='italic' textColor='gray.500'>{eventDescription} <DisplayAddress address={eventActor}/></Text>
    </VStack>
  </HStack>)
}

export const ApprovalEvent = ({event, receipt}) => {
  return (<HStack pos='relative'>
    <FcApproval size='24px'/>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Token Approval</Text>
      <Text fontStyle='italic' textColor='gray.500'>For <AddressAlias address={event.topics.spender}/></Text>
    </VStack>
  </HStack>)
}

export const KeyBurnedEvent = ({event, receipt}) => {
  const keyInfo = useInspectKey(event.topics.keyId);

  return (<HStack pos='relative'>
    <Skeleton isLoaded={keyInfo} width='2em' height='2.5em'>
      {keyInfo && <KeyIcon keyInfo={keyInfo} size='32px'/> }
      <Box pos='absolute' left='12px' top='15px'><ImMinus size='16px' color='#FF6666'/></Box>
    </Skeleton>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Key Revoked</Text>
      <Text fontStyle='italic' textColor='gray.500'>From <AddressAlias address={event.topics.target}/></Text>
    </VStack>
  </HStack>)
}

export const TransferEvent = ({event, receipt}) => {
  return (<HStack pos='relative'>
    <FcMoneyTransfer size='24px'/>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Token Transfer</Text>
      <Text fontStyle='italic' textColor='gray.500'>To <AddressAlias address={event.topics.to}/></Text>
    </VStack>
  </HStack>)
}

export const AlarmClockRegisteredEvent = ({event, receipt}) => {
  return (<HStack ml='3px' pos='relative'>
    <FcAlarmClock size='28px'/>
    <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Alarm Clock Created</Text>
      <Text fontStyle='italic' textColor='gray.500'>{(new Date(event.topics.alarmTime*1000)).toDateString()}</Text>
    </VStack>
  </HStack>)
}

export const AlarmClockSnoozedEvent = ({event, receipt}) => {
  return (<HStack ml='3px' pos='relative'>
    <FcAlarmClock size='28px'/>
    <Box pos='absolute' left='8px' top='20px'><FcApproval size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Alarm Clock Snoozed</Text>
      <Text fontStyle='italic' textColor='gray.500'>Until {(new Date(event.topics.newAlarmTime*1000)).toDateString()}</Text>
    </VStack>
  </HStack>)
}

export const AlarmClockChallengedEvent = ({event}) => {
  const eventInfo = useEventInfo(event.topics.eventHash);

  return (<HStack ml='3px' pos='relative'>
    <FcOvertime size='28px'/>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Alarm Challenged</Text>
      <Text fontStyle='italic' textColor='gray.500'><b>{eventInfo ? eventInfo.description : 'Event'}</b> was fired.</Text>
    </VStack>
  </HStack>)
}

export const RecoveryCreatedEvent = ({event, receipt}) => {
  return (<HStack ml='3px' pos='relative'>
    <MdHealthAndSafety color='#3186CE' size='28px'/>
    <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Recovery Enabled</Text>
      <Text fontStyle='italic' textColor='gray.500'>{event.topics.guardians.length} Recovery Addresses</Text>
    </VStack>
  </HStack>)
}

export const KeyLockerDepositEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.keyId);

  return (<HStack ml='3px' pos='relative'>
    <FcFilingCabinet size='28px'/>
    <Box pos='absolute' left='8px' top='20px'><FcPlus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{keyInfo ? "'" + keyInfo.alias + "'": 'Key'} Lockered</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        Deposited by <AddressAlias address={event.topics.operator}/>
      </Text>
    </VStack>
  </HStack>) 
}

export const KeyLockerLoanEvent = ({event}) => {
  const keyInfo = useInspectKey(event.topics.keyId);

  return (<HStack ml='3px' pos='relative'>
    <FcFilingCabinet size='28px'/>
    <Box pos='absolute' left='8px' top='20px'><ImMinus size='16px'/></Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>{keyInfo ? "'" + keyInfo.alias + "'": 'Key'} Borrowed</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        Borrowed by <AddressAlias address={event.topics.destination}/>
      </Text>
    </VStack>
  </HStack>)
}

export const GuardiansChangedEvent = ({event}) => {
  const policy = useRecoveryPolicy(event.topics.rootKeyId);

  return (<HStack ml='3px' pos='relative'>
    <FcCustomerSupport size='28px'/>
    <Box pos='absolute' left='8px' top='20px'>{ event.topics.added[0] ? <FcPlus size='16px'/> : <ImMinus size='16px'/> }</Box>
    <VStack align='stretch' spacing='0em' fontSize='0.8em'>
      <Text fontWeight='bold'>Addresses { event.topics.added[0] ? 'Added' : 'Removed' }</Text>
      <Text fontStyle='italic' textColor='gray.500'>
        New total of <b>{ policy && policy.guardians.length }</b> addresses.
      </Text>
    </VStack>
  </HStack>)
}

export const KeyRecoveredEvent = ({event}) => {}
export const TrustEventLoggedEvent = ({event}) => {}
export const InitializedEvent = ({event}) => {}
export const UpgradedEvent = ({event}) => {}
export const NotaryEventRegistrationApprovalEvent = ({event}) => {}
export const TrustEventRegisteredEvent = ({event}) => {}
export const DefaultTransactionEvent = ({event}) => {
  return <Text>{event.name}</Text>
}
