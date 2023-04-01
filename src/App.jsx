import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { useColorModeValue } from '@chakra-ui/react'
import SidebarWithHeader from './AppChrome.jsx'

function App() {
  return <Router>
    <SidebarWithHeader>
      <div>Hello</div>
    </SidebarWithHeader>
  </Router>
}

export default App
