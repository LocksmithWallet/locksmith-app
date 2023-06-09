import { 
  Button
} from '@chakra-ui/react';
import { ConnectKitButton } from "connectkit";
import { BiLink } from 'react-icons/bi';
import { DisplayAddress } from '../components/Address';
import { Fade } from 'react-awesome-reveal';

export const WalletConnector = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <Button onClick={show} size='sm' leftIcon={<BiLink/>} boxShadow='lg'>
            {isConnected ? <DisplayAddress address={address}/> : "Connect"}
          </Button>
        )}}
    </ConnectKitButton.Custom>
  );
};
