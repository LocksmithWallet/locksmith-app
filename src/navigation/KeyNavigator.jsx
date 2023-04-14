import { React, useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

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
  useTrustInfo
} from '../hooks/contracts/Locksmith';

import { FcSettings } from 'react-icons/fc';

// components
import { KeyIcon } from '../components/Key';

export const KeyNavigator = (onClose) => {
  const [unsortedKeys, setUnsortedKeys] = useState([]); // this is an array of key IDs
  const [sortedKeys, setSortedKeys] = useState({});     // this is a map of trust ID strings to key arrays
  const keys = useWalletKeys();
 
  // when the keys load
  useEffect(() => {
    // this might happen on network or account switching
    if (!keys.data) { return; }

    // set the pile of keys 
    setUnsortedKeys(keys.data.map((k) => k.toString()));

    // clear all the sorted ones out
    setSortedKeys({});
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

    // sort the key
    setSortedKeys((previous) => {
      var sorted = {... previous};
      sorted[inspection.trustId.toString()] ||= [];
      sorted[inspection.trustId.toString()].push(inspection);
      return sorted; 
    });
  };

  return <Box m='8'>
    { unsortedKeys.map((uk) => <KeyInspector key={'ki-'+uk.toString()} keyId={uk} sortKey={sortKey}/>) } 
    <LayoutGroup>
      { Object.keys(sortedKeys).map(
        (tid, i) => <motion.div 
          layout 
          key={'tn'+tid} 
          initial={{opacity: 0, x: -100}}
          animate={{opacity: 1, x: 0}}
          transition={{type: 'spring', delay: i * 0.25}}>
            <TrustNavigationBox trustId={tid} keys={sortedKeys[tid]}/>
        </motion.div>
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

export const TrustNavigationBox = ({trustId, keys}) => {
  const trust = useTrustInfo(trustId);
  const hasRoot = trust && keys.filter(
    (k) => k.keyId === trust.rootKeyId.toString()).length > 0;
  return ( trust &&
    <Box bg='gray.200' boxShadow='inner' borderRadius='md' mb='1em'>
      <HStack p='0.5em'>
        <Heading fontSize='md'>{trust.name}</Heading>
        <Spacer/>
        { hasRoot && <motion.div
            style={{cursor: 'pointer'}}
            whileHover={{scale: 1.5, rotate: 360}}
            whileTap={{scale: 0.95}}
            initial={{opacity: 0, x: 50}}
            animate={{opacity:1, x:0}}>
          <FcSettings size='20px'/></motion.div> }
      </HStack>
      <List mt='0.5em' pb='0.5em' spacing='1em'>
        { keys.sort((a, b) => a.isRoot ? -1 : (b.isRoot ? 1 : 0)).
          map((k, i) => <KeyListItem key={'kl'+k.keyId.toString()} k={k} i={i}/>)}
      </List>
    </Box>
  )
}

export const KeyListItem = ({k, i, ...rest}) => {
  const [isHover, setHover] = useState(false);

  return <ListItem key={'kl'+k.keyId.toString()} pos='relative'>
    <motion.div layout
      onMouseEnter={() => { setHover(true); }}
      onMouseLeave={() => { setHover(false); }}
      style={{cursor: 'pointer'}}
      initial={{opacity: 0, y: 50}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: i * 0.25, transition: {layout: {duration: 0.5}}}}>
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
        <KeyIcon keyInfo={k} size='30px' props={{style: {zIndex: 1}}}/>
        <Text fontSize='lg' style={{zIndex: 1}}>{k.alias}</Text>
        <Spacer/>
        <Text style={{zIndex: 1}} fontSize='sm' fontStyle='italic' textColor='gray.400'>#{k.keyId}</Text>
      </HStack>
     </motion.div>
   </ListItem>
}
