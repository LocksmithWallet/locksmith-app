//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { useNavigate } from 'react-router-dom';
import { React, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Text,
  Spinner,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from "connectkit";
import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';
import { RiLock2Fill } from 'react-icons/ri';

import { 
  motion, 
  AnimatePresence, 
  LayoutGroup,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { Fade, AttentionSeeker } from 'react-awesome-reveal';
import { BiLink } from 'react-icons/bi';

import { useMintTrust } from './hooks/contracts/TrustCreator.jsx';

export function Home() {
  const account = useAccount();
  return (<VStack> 
    <HStack spacing='0' mt='1em'>
      <Fade direction='left' duration='500'><Heading fontSize='6xl'>L</Heading></Fade>
      <Fade>
        <AttentionSeeker effect='bounce'>
        <RiLock2Fill size='52px'/>
        </AttentionSeeker>
      </Fade>
      <Fade direction='right' duration='500'><Heading fontSize={'6xl'}>cksmith</Heading></Fade>
    </HStack>
    <Fade direction='up' duration='500'>
      <Text color={'gray.600'} fontSize={'xl'}>
        Turn your wallet into a bank.
      </Text>
    </Fade>
    <VStack pt='3em'>
      <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return <><AnimatePresence>{!isConnected ? (<motion.div
          style={{position: 'absolute'}}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0, transition: {delay: 0}}}
          transition={{duration: 0.5, delay: 0.5}}>
          <Button
            as={motion.button}
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.95, y: 10}}
            onClick={show}
            colorScheme='blue'
            size='lg'
            border='1px' borderColor='blue.500'
            boxShadow='dark-lg'
            leftIcon={<BiLink/>}>Connect</Button>
        </motion.div>) : ''
          }</AnimatePresence>
          <AnimatePresence>
            {isConnected && (<motion.div exit={{opacity: 0, y: 600, transition: {type: 'spring'}}}> 
              <CreateAccount/>
            </motion.div>) }
          </AnimatePresence>
        </>
        }}
      </ConnectKitButton.Custom>
    </VStack>
  </VStack>)
}

const CreateAccount = ({}) => {
  const navigate = useNavigate();

  // Animations
  const [choice, setChoice] = useState(-1);
  const controls = useAnimation();
  const buttonControls = useAnimation();
  
  // form state and transaction
  const [name, setName] = useState('');
  const [transaction, setTransaction] = useState(null);
  const mintTrust = useMintTrust(name, (error) => {
    // error toast
  }, (data) => {
    // track pending transaction
    setTransaction(data);
    setTimeout(()=> {navigate('/reveal/'+data.hash);}, 500);
  });
  const nameTooShort = name.length < 3;
  const calculatingGas = !nameTooShort && !mintTrust.write;
  const disabled = nameTooShort || calculatingGas;

  useEffect(() => {
    if(choice >= 0) {
      controls.start('choice');
    } else {
      controls.start('start');
    }
  }, [choice]);

  useEffect(() => {
    if(!nameTooShort && !calculatingGas) {
      buttonControls.start({
        y: [-6, -2, 0],
        scale: [ 1.02, 1.05, 1],
      }); 
    }
  }, [nameTooShort, calculatingGas]);

  return (<LayoutGroup><AnimatePresence>
    { !transaction && <motion.div layout exit={{y: 600, opacity: 0}}>
    <VStack spacing='3em'>
      <VStack>
      <motion.div 
        variants={{
          'choice': {opacity: 0, y: -80, transition: {type: 'spring'}},
          'start': {opacity: 1, y: 0, transition: {type: 'spring'}} 
        }}
        initial={{y: 80}} animate={controls}>
        <Text fontWeight='bold' size='lg'>Tap Any Key to Start</Text>
      </motion.div>
      { choice >= 0 && <motion.div
        variants={{
          'choice': {opacity: 1, y: -40, transition: {type: 'spring'}},
          'start': {}
        }}
        initial={{visiblility: 'hidden', y: 80}} animate={controls}>
        <Text fontWeight='bold' size='lg'>Name Your Treasury</Text>
      </motion.div> }
      </VStack>
      <HStack spacing='0'>
        <Box m='0' p='0' onClick={() => {setChoice(0);}}>
          <CreateAccountKey delay={0} choice={choice}/>
        </Box>
        <Box m='0' p='0' onClick={() => {setChoice(1);}}>
          <CreateAccountKey delay={1} choice={choice}/>
        </Box>
        <Box m='0' p='0' onClick={() => {setChoice(2);}}>
          <CreateAccountKey delay={2} choice={choice}/>
        </Box>
        <Box m='0' p='0' onClick={() => {setChoice(3);}}>
          <CreateAccountKey delay={3} choice={choice}/>
        </Box> 
        <Box m='0' p='0' onClick={() => {setChoice(4);}}>
          <CreateAccountKey delay={4} choice={choice}/>
        </Box> 
        <Box m='0' p='0' onClick={() => {setChoice(5);}}>
          <CreateAccountKey delay={5} choice={choice}/>
        </Box> 
        <Box m='0' p='0' onClick={() => {setChoice(6);}}>
          <CreateAccountKey delay={6} choice={choice}/>
        </Box> 
        <Box m='0' p='0' onClick={() => {setChoice(7);}}>
          <CreateAccountKey delay={7} choice={choice}/>
        </Box> 
      </HStack>
    </VStack>
    { choice >= 0 && <VStack>
      <Box 
        as={motion.div} 
        initial={{opacity: 0}} 
        animate={{opacity: 1, transition: {delay: 0.25, duration: 0.25}}} 
        style={{
          position: 'relative',
          top: -94
        }}>
        <Input border='1px' borderColor='yellow.300' bgColor='white' textAlign='center' 
          placeholder='My Treasury' width='10em' size='lg'
          maxLength={15}
          onChange={(e) => { 
            setName(e.target.value); 
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !nameTooShort) {
              mintTrust.write?.(); 
            }
          }}
        />
      </Box>
      <motion.div animate={buttonControls}>
      <Button {... {isDisabled: disabled}} isLoading={mintTrust.isLoading} as={motion.button} 
        initial={{y: 100, opacity: 0, scale: 0}}
        animate={{y: 0, opacity: [0,0.1,0.2,0.4,1], scale: [0, 0.1, 0.3, 0.6, 1], transition: {duration: 0.3}}}
        color='gray.700' 
        whileHover={!disabled && {scale: 0.97}}
        whileTap={!disabled && {scale: 0.92}} 
        colorScheme='yellow' 
        borderRadius='full' 
        boxShadow='lg'
        size='lg' 
        border={!disabled && '1px'}
        borderColor={!disabled && 'yellow.100'}
        leftIcon={ calculatingGas ? <Spinner size='sm'/> : <HiOutlineKey/>}
        onClick={() => { mintTrust.write?.(); } }
        style={{
          top: -80
        }}>{mintTrust.isLoading ? 'Signing' : 'Mint Key'}</Button>
      </motion.div>
    </VStack> }
    </motion.div> } </AnimatePresence>
    </LayoutGroup>)
}

const CreateAccountKey = ({delay, onChoose, choice, ... rest}) => {
  // animations
  const [isClicked, setClicked] = useState(false);
  const [isStopped, stop] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(-220);
  
  useEffect(() => {
    if (!isClicked) {
      // starting 
      controls.start({
        x: 150,
        transition: { duration: 8 - delay }
      });
    } else {
      // clicked
      var go = async() => {
        await controls.stop();
        await controls.start({
          scale: 5.8,
          rotateY: 0,
          opacity: 1, 
          x: 0,
          y: 100,
          transition: {
            type: 'linear',
            duration: 0.5,
          }
        }); 
      };
      go();
    }
  }, [isClicked]);

  const rotateY = useTransform(x, [-220, 150], [90, -90])
  const opacity = useTransform(x, [-220, -60, 150], [0, 1, 0]);
  const scale = useTransform(x, [-220, -60, -150], [0.5, 1.4, 0.5]);
  return !isClicked ? <motion.div
    id={"select-key"+delay}
    style={{
      width: 80,
      height: 80,
      x, 
      scale, 
      position: 'absolute', 
      rotateY, 
      opacity,
      cursor: 'grab'
    }}
    initial={{x: -220 + (delay*60)}}
    animate={controls}
    onUpdate={() => { if(choice >=0) { 
        controls.stop();
        controls.start({
          opacity: 0,
          y: -100,
          transition: {type: 'linear', duration: 0.5}
        }); 
      } 
    }}
    onAnimationComplete={ (definition) => {
      if(choice >= 0) { return; } 
      controls.set({x: -220}); 
      controls.start({
        x: 150,
        transition: { duration: 8 } 
      });
    }}
    onClick={() => {if(choice < 0) {setClicked(true);}}}> 
      <FcKey size='80px'/>
  </motion.div> : 
    <motion.div
      style={{
        x,
        rotateY,
        width: 80,
        height: 80,
      }}
      animate={controls}>
        <FcKey size='80px'/>
    </motion.div>
}
