//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import { useNavigate } from 'react-router-dom';
import { React, useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Input,
  Text,
  Skeleton,
  Spacer,
  VStack,
} from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';
import { Networks } from './configuration/Networks';
import { ConnectKitButton } from "connectkit";
import { FcKey, FcApproval } from 'react-icons/fc';
import { ethers } from 'ethers';
import { GAS_ARN } from './configuration/AssetResource';

import { 
  motion, 
  AnimatePresence, 
  useAnimation,
} from 'framer-motion';
import { BiLink } from 'react-icons/bi';
import { AttentionSeeker } from 'react-awesome-reveal';
import { TransactionListContext } from './components/TransactionProvider';
import { useNetworkGasTokenPrice, USDFormatter } from './hooks/Prices';
import { useMintTrust } from './hooks/contracts/TrustCreator';

export function Onboard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const shrinker = useAnimation();
  const intros = function(x) {
    return {
      initial: {
        opacity: 0,
        y: '100px',
      },
      animate: {
        opacity: 1,
        y: '0px',
        transition: {
          duration: 0.5,
          delay: 0.5 + x * 0.25
        }
      },
    }
  };

  return (<VStack ml={{base: 0, md: 72}}> 
    <HStack spacing='0' mt='1em' as={motion.div} animate={shrinker}>
      <motion.div  initial={{x: -100}} animate={{x: 0}} transition={{duration: 0.5}}>
        <Heading fontSize='6xl'>L</Heading>
      </motion.div>
      <AttentionSeeker effect='bounce'>
        <Image style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}} src='/gold-lock-small.png'/>
      </AttentionSeeker>
      <motion.div  initial={{x: 100}} animate={{x: 0}} transition={{duration: 0.5}}>
        <Heading fontSize="6xl" data-text="cksmith">
          cksmith
        </Heading>
      </motion.div>
    </HStack>
    <AnimatePresence>
      { step == 0 && (<motion.div initial={{y: 50}} animate={{y: 0}} transition={{duration: 0.5}} exit={{opacity: 0, transition: {duration: 0.1}}}>
        <Text color={'gray.600'} fontSize={'xl'}>
          Turn your wallet into a bank.
        </Text>
      </motion.div>) }
    </AnimatePresence>
    <AnimatePresence>
    { step == 0 && <VStack pt='2em' maxWidth='20em' spacing='1em' as={motion.div} exit={{x: '-100vw', opacity: 0}}>
      <HStack as={motion.div} {... intros(0)}>
        <FcKey size='80px'/>
        <VStack fontSize='xl' align='stretch' spacing='0em'>
          <Text>Mint a <b>Master Key</b> and get:</Text>
        </VStack>
      </HStack>
      <HStack pl='20px' as={motion.div} {... intros(1)}>
        <FcApproval size='80px' style={{position: 'relative', top: '-10px'}}/>
        <VStack align='stretch' spacing='0em' pl='20px'>
          <Text fontSize='md' fontWeight='bold'>Secure Virtual Wallets</Text>
          <Text color='gray.600' fontSize='sm'>Create as many accounts as you need, controlled by your wallet.</Text>
        </VStack>
      </HStack>
      <HStack pl='20px' as={motion.div} {... intros(2)}>
        <FcApproval size='80px' style={{position: 'relative', top: '-10px'}}/>
        <VStack align='stretch' spacing='0em' pl='20px'>
          <Text fontSize='md' fontWeight='bold'>Granular Permissions</Text>
          <Text color='gray.600' fontSize='sm'>Add or remove anyone to or from your accounts at any time.</Text>
        </VStack>
      </HStack>
      <HStack pl='20px' as={motion.div} {... intros(3)}>
        <FcApproval size='80px' style={{position: 'relative', top: '-10px'}}/>
        <VStack align='stretch' spacing='0em' pl='20px'>
          <Text fontSize='md' fontWeight='bold'>Account Recovery</Text>
          <Text color='gray.600' fontSize='sm'>Recover all of your accounts if you lose access to your wallet.</Text>
        </VStack>
      </HStack>
      <HStack width='100%' as={motion.div} {... intros(4)}>
        <Button width='100%'
          as={motion.button}
          whileHover={{scale: 1.1}}
          whileTap={{scale: 0.95, y: 5}}
          onClick={() => { shrinker.start({scale: 0.6, position: 'relative', top: '-20px'}); setStep(1); }}
          colorScheme='blue'
          size='lg'
          border='1px' borderColor='blue.500'
          boxShadow='dark-lg'>Start</Button>
      </HStack>
    </VStack> }
    </AnimatePresence>
    <AnimatePresence>
      { step === 1 && (<VStack maxWidth='20em' spacing='1em' as={motion.div} initial={{y: '25px', opacity: 0}} animate={{y: 0, opacity: 1, transition: {delay: 0.5}}} exit={{x: '-100vw'}}>
        <HStack> 
          <FcKey size='80px'/>
          <VStack fontSize='xl' align='stretch' spacing='0em'>
            <Text>This is your <b>Master Key</b>.</Text>
          </VStack>
        </HStack>
        <HStack pl='1em' spacing='1em'> 
          <Image src='/gold-lock-large.png' width='60px'/>
          <VStack fontSize='xl' align='stretch' spacing='0em'>
            <Text>It controls your <b>Trust</b>, or collection of accounts.</Text>
          </VStack>
        </HStack>
        <Text fontSize='xl' fontWeight='bold'>Name Your Trust</Text>
        <Input border='1px' borderColor='blue.300' bgColor='white' textAlign='center'
          placeholder='My Trust' width='100%' size='lg'
          maxLength={15}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !nameTooShort) {
            
            }
          }}
        />
        <ActionButton name={name}/>
      </VStack>) }
    </AnimatePresence>
  </VStack>)
}

export function ActionButton({name, ...rest}) {
  return <ConnectKitButton.Custom>
    {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
      return !isConnected ? (
          <Button width='100%'
            as={motion.button}
            whileTap={{scale: 0.95, y: 5}}
            onClick={show} 
            colorScheme='blue'
            size='lg'
            border='1px' borderColor='blue.500'
            leftIcon={<BiLink/>}
            boxShadow='dark-lg'>Connect to Mint</Button>) : (
          <MintMasterKey name={name}/>)
    }}
  </ConnectKitButton.Custom>
}

export function MintMasterKey({name, ...rest}) {
  const nameTooShort = name.length < 3;
  const navigate = useNavigate();
  const network = useNetwork();
  const gasAssetPrice = useNetworkGasTokenPrice();
  const transactions = useContext(TransactionListContext);
  const mintTrust = useMintTrust(name, (error) => {
    // error toast
  }, (data) => {
    // track pending transaction
    transactions.addTransaction({
        type: 'CREATE_TRUST',
        title: 'Create Trust',
        subtitle: name,
        data: data
      });
    setTimeout(()=> {navigate('/reveal/'+data.hash);}, 500);
  });
  const totalGas = (mintTrust.gasPrice && mintTrust.gasLimit) ? ethers.utils.formatEther(mintTrust.gasPrice.mul(mintTrust.gasLimit)) : 0;
  const mintCostUsd = USDFormatter.format((mintTrust.gasPrice && mintTrust.gasLimit && gasAssetPrice.data) ?
    gasAssetPrice.data * totalGas : 0);

  return (<VStack width='100%' pt='1em'>
    <HStack width='100%'>
      <Text>Estimate:</Text>
      <Spacer/>
      <Skeleton isLoaded={mintTrust.gasPrice && mintTrust.gasLimit && gasAssetPrice.data}>
        <Text>{mintCostUsd} (~{parseFloat(totalGas).toFixed(5)} {Networks.getAsset(network.chain.id, GAS_ARN).symbol})</Text>
      </Skeleton>
    </HStack>
    <Button width='100%'
          as={motion.button}
          isLoading={mintTrust.isLoading || !mintTrust.write}
          isDisabled={nameTooShort || !mintTrust.write}
          whileTap={{scale: 0.95, y: 5}}
          onClick={() => { mintTrust.write(); }} 
          colorScheme='blue'
          size='lg'
          border='1px' borderColor='blue.500'
          leftIcon={ mintTrust.write && <FcKey size='28px'/>}
          boxShadow='dark-lg'>Mint Master Key</Button>
  </VStack>)
}

