import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  List,
  ListItem,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

// animations
import { 
  AnimatePresence, 
  LayoutGroup,
  motion, 
  useAnimationControls,
} from 'framer-motion';

// hooks
import { useWalletKeys } from '../hooks/contracts/KeyVault';
import { 
  useInspectKey,
  useTrustInfo,
  useTrustKeys,
} from '../hooks/contracts/Locksmith';
import {
  useKeyInboxAddress
} from '../hooks/contracts/PostOffice';
import {
  useGuardianPolicies
} from '../hooks/contracts/TrustRecoveryCenter';

import {
  KEY_CONTEXT,
} from '../hooks/contracts/Ledger';
import { ContextBalanceUSD } from '../components/Ledger';
import { AddressAvatar } from '../components/Address';
import { MdHealthAndSafety } from 'react-icons/md';

// components
import { KeyIcon } from '../components/Key';

export const KeyNavigator = (onClose) => {
  const [unsortedKeys, setUnsortedKeys] = useState([]); // this is an array of key IDs
  const [foundRootTrusts, setFoundRootTrusts] = useState([]); // an array of root key ids we've found
  const [sortedKeys, setSortedKeys] = useState({});     // this is a map of trust ID strings to key arrays
  const keys = useWalletKeys();
  const account = useAccount();
  const recoveryPolicies = useGuardianPolicies(account.address);
  const navigate = useNavigate();

  // when the keys load
  useEffect(() => {
    // this might happen on network or account switching
    if (!keys.data) { return; }
   
    // clear out all of the found root trusts
    setFoundRootTrusts([]);

    // clear all the sorted ones out
    setSortedKeys({});

    // set the pile of keys 
    setUnsortedKeys(keys.data.map((k) => k.toString()));
  }, [keys.data]);

  // when a key get's its data back
  const sortKey = function(keyId, inspection) {
    // the key came back as invalid in hardhat,
    // what do we do if we throw away the result?
    if (!inspection.isValid) { return; }

    // remove the key from unsorted
    setUnsortedKeys((previous) => {
      return previous.filter((k) => k !== keyId);
    });

    // sort the key, and spawn a trust collector
    // if its a root key. Be careful to only sort
    // or spawn if it isn't already there.
    setSortedKeys((previous) => {
      var sorted = {... previous};
      sorted[inspection.trustId.toString()] ||= [];
      
      // immmediately stop if its been sorted already.
      // a particularly gross implementation because
      // the objects aren't easily comparable
      if(sorted[inspection.trustId.toString()].filter((i) => i.keyId.toString() === keyId.toString()).length > 0) {
        return sorted;
      }

      // sort the inspection into the trust category
      sorted[inspection.trustId.toString()].push(inspection);
      
      // do we want to show root escalation?
      if(inspection.isRoot) {
        setFoundRootTrusts((prev) => {
          // make sure we aren't duplicating
          if (prev.filter((tid) => tid.eq(inspection.trustId)).length > 0) {
            return prev;
          }

          return [prev, inspection.trustId].flat(2);
        });
      }

      return sorted; 
    });
  };

  return <Box m='8'>
    { unsortedKeys.map((uk) => <KeyInspector key={'ki-'+uk.toString()} keyId={uk} sortKey={sortKey}/>) }
    { foundRootTrusts.map((t) => <TrustInspector key={'ti-'+t.toString()} trustId={t} setUnsortedKeys={setUnsortedKeys}/>) }
    <LayoutGroup>
      { recoveryPolicies.isSuccess && recoveryPolicies.data.length > 0 && (
        <Box as={motion.div} layout bg='gray.200' boxShadow='inner' borderRadius='md' mb='1em'>
          <HStack p='0.5em' style={{cursor: 'pointer', background: 'none'}} as={motion.div} whileHover={{background: '#EEE'}}
              onClick={() => {navigate('/recovery');}}>
            <MdHealthAndSafety size='30' color='#3186CE'/>
            <Text>Trust Recovery</Text>    
          </HStack>
        </Box>) }
      { Object.keys(sortedKeys).map(
        (tid, i) => <TrustNavigationBox key={'tn-'+tid} trustId={tid} keys={sortedKeys[tid]} onClose={onClose}/>
      )}
    </LayoutGroup>
  </Box>
};

export const KeyInspector = ({keyId, sortKey}) => {
  const keyData = useInspectKey(keyId);
  useEffect(() => {
    if(keyData !== null) { 
      sortKey(keyId, keyData); 
    }
  }, [keyData]);
  return '';
}

export const TrustInspector = ({trustId, setUnsortedKeys}) => {
  const trustKeys = useTrustKeys(trustId);
  useEffect(() => {
    if(trustKeys.data) {
      setUnsortedKeys((previous) => {
        var merge = {};
        previous.forEach((p) => {merge[p.toString()] = p;});
        trustKeys.data.forEach((k) => {merge[k.toString()] = k});
        return Object.values(merge);
      });
    } 
  }, [trustKeys.data]);
}

export const TrustNavigationBox = ({trustId, keys, onClose}) => {
  const navigate = useNavigate();
  const trust = useTrustInfo(trustId);
  const hasRoot = trust && keys.filter(
    (k) => k.keyId === trust.rootKeyId.toString()).length > 0;
  return ( trust &&
    <Box as={motion.div} layout bg='gray.200' boxShadow='inner' borderRadius='md' mb='1em'>
      <HStack p='0.5em'>
        <Heading fontSize='md'>{trust.name}</Heading>
        <Spacer/>
        { hasRoot && <motion.div
          style={{cursor: 'pointer'}}
            whileHover={{scale: 1.8}}
            whileTap={{scale: 1.5}}
            onClick={() => { onClose.onClose(); navigate('/trust/' + trustId); }}>
              <Image width='22px'style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} src='/gold-lock-small.png'/>
        </motion.div> }
      </HStack>
      <List mt='0.5em' pb='0.5em' spacing='1em'>
        { keys.sort((a, b) => a.isRoot ? -1 : (b.isRoot ? 1 : 0)).
          map((k, i) => <KeyListItem key={'kl'+k.keyId.toString()} k={k} i={i} onClose={onClose}/>)}
      </List>
    </Box>
  )
}

export const KeyListItem = ({k, i, onClose, ...rest}) => {
  const [isHover, setHover] = useState(false);
  const navigate = useNavigate();
  const inbox = useKeyInboxAddress(k.keyId);

  return (inbox.data && ethers.constants.AddressZero !== inbox.data) && <ListItem key={'kl'+k.keyId.toString()} pos='relative'>
    <motion.div layout
      transition={{layout: {duration: 0}}}
      onMouseEnter={() => { setHover(true); }}
      onMouseLeave={() => { setHover(false); }}
      onClick={() => { onClose.onClose(); navigate('/key/' + k.keyId); }}
      style={{cursor: 'pointer'}}>
      <AnimatePresence>
        { isHover && <motion.div
          layoutId={'key-selection-'+k.trustId}
          transition={{layout: {duration: 0.2}}}
          exit={{opacity: 0}}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#EEE',
            zIndex: 0,
          }}/>}
      </AnimatePresence>
      <HStack px='0.5em'>
        { k.isRoot && <KeyIcon keyInfo={k} size='30px' style={{zIndex: 1}}/> }
        { !k.isRoot && inbox.data && <Box zIndex='1'><AddressAvatar size='30' address={inbox.data}/></Box> }
        <VStack spacing='0' align='stretch'>
          <Text fontSize='lg' style={{zIndex: 1}}>{k.alias}</Text>
          <ContextBalanceUSD contextId={KEY_CONTEXT} identifier={k.keyId}
            skeletonProps={{}}
            textProps={{
              fontSize: 'sm',
              fontStyle: 'italic',
              textColor: 'gray.400',
              zIndex: 1
          }}/>
        </VStack>
      </HStack>
     </motion.div>
   </ListItem>
}
