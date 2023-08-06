import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useLocksmithRead, useLocksmithWrite } from '../Utils';


/**
 * useAlarmClock
 *
 * Gets the alarm clock metadata. 
 */
export function useAlarmClock(eventHash) {
  const [eventData, setEventData] = useState(null);
  const eventInfo = useLocksmithRead('AlarmClock', 'alarms', [eventHash], eventHash !== null || eventHash !== '', false); 
  
  useEffect(() => {
    if (!eventInfo.data) { return; }

    setEventData({
      isValid: eventHash === eventInfo.data[0],
      alarmTime: eventInfo.data[1],
      snoozeInterval: eventInfo.data[2],
      snoozeKeyId: eventInfo.data[3]
    });
  }, [eventInfo.data]);

  return eventData;
}
