import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { useColorModeValue } from '@chakra-ui/react'
import SidebarWithHeader from './AppChrome'
import { ConnectKitProvider } from "connectkit";

function App() {
  return <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}> 
    <Router>
      <SidebarWithHeader>
        <div>Hello</div>
      </SidebarWithHeader>
    </Router>
  </ConnectKitProvider>
}

export default App
