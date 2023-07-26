import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "react-query";

// Chakra UI 
import { ChakraProvider } from '@chakra-ui/react'

// Wagmi Configuration
import { WagmiConfig, createClient, configureChains} from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

// Supported Network Configurations
import { Networks } from './configuration/Networks'
import { HardHat } from './configuration/networks/Hardhat'
import { BaseGoerli } from './configuration/networks/BaseGoerli'
import { Base } from './configuration/networks/Base';

// Locksmith App Component
import App from './App'

// Add Network Support
Networks.addNetwork(Base);
Networks.addNetwork(BaseGoerli);
Networks.addNetwork(HardHat);

// Generate Wagmi Controllers
const {chains, provider, webSocketProvider} = configureChains(Networks.wagmiChains(),[
  alchemyProvider({apiKey:'WSAWLyjeB3wKvm1lqL1umFKBoYzETSQ5'}),
  publicProvider(),
]);
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({chains}),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Locksmith',
      }
    })
  ],
  provider,
  webSocketProvider,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> 
      <WagmiConfig client={client}>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
)
