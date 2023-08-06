import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useLocksmithRead, useLocksmithWrite } from '../Utils';


/**
 * useEventInfo 
 *
 * Calls getEventInfo() on the trust event log. 
 */
export function useEventInfo(eventHash) {
  const [eventData, setEventData] = useState(null);
  const eventInfo = useLocksmithRead('TrustEventLog', 'getEventInfo', [eventHash], eventHash !== null || eventHash !== '', false); 
  
  useEffect(() => {
    if (!eventInfo.data) { return; }

    setEventData({
      isValid: eventInfo.data[0],
      description: ethers.utils.parseBytes32String(eventInfo.data[1]),
      dispatcher: eventInfo.data[2],
      fired: eventInfo.data[3]
    });
  }, [eventInfo.data]);

  return eventData;
}
