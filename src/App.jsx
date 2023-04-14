// core dependencies
import { React, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useColorModeValue } from '@chakra-ui/react';
import { ConnectKitProvider } from "connectkit";
import { useAccount } from 'wagmi';

// animations
import { AnimatePresence, motion } from 'framer-motion';

// App Components
import SidebarWithHeader from './AppChrome';
import { Home } from './Home';
import { RevealTrust } from './RevealTrust';
import { Key } from './Key';

function App() {
  return <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}
    options={{initialChainId: 0}}> 
    <Router>
      <SidebarWithHeader>
        <AnimatedRoutes/>
      </SidebarWithHeader>
    </Router>
  </ConnectKitProvider>
}

export const AnimatedRoutes = () => {
  const account = useAccount();
  const location = useLocation();
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (<AnimatePresence mode='wait'><Routes key={location.pathname} location={location}>
    { account.isConnected && <Route path='/reveal/:txn' element={
      <motion.div key='reveal' initial={{y: '-100vh'}} animate={{y: 100}} exit={{y: '100vh', transition: pageTransition}}>
        <RevealTrust/>
      </motion.div>
    }/> }
    { account.isConnected && <Route path='/key/:keyId' element={
      <motion.div key='show-key' initial={{x: '100vh'}} animate={{x: 0}} exit={{y: '100vh', transition: pageTransition}}>
        <Key/>
      </motion.div>
    }/> }
    <Route path='*' element={
      <motion.div key='home' initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, transition: pageTransition}}>
        <Home/>
      </motion.div>
    }/>
  </Routes></AnimatePresence>)
}

export default App
