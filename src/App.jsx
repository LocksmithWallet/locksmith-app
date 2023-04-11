import { React, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import { useColorModeValue } from '@chakra-ui/react';
import SidebarWithHeader from './AppChrome';
import { ConnectKitProvider } from "connectkit";
import { useAccount } from 'wagmi';
import { Home } from './Home';
import { RevealTrust } from './RevealTrust';

function App() {
  const account = useAccount();

  return <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}
    options={{initialChainId: 0}}> 
    <Router>
      <SidebarWithHeader>
          <Routes>
            { account.isConnected && <Route path='/reveal/:txn' element={<RevealTrust/>}/> }
            <Route path='*' element={<Home/>} />
          </Routes>
      </SidebarWithHeader>
    </Router>
  </ConnectKitProvider>
}

export default App
