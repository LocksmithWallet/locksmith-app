import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useColorModeValue } from '@chakra-ui/react';
import SidebarWithHeader from './AppChrome';
import { ConnectKitProvider } from "connectkit";

import { Home } from './Home';

function App() {
  return <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}> 
    <Router>
      <SidebarWithHeader>
          <Routes>
            <Route exact path='/' element={<Home/>} />
          </Routes>
      </SidebarWithHeader>
    </Router>
  </ConnectKitProvider>
}

export default App
