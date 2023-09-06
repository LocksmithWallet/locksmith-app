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
  const eventInfo = useLocksmithRead('AlarmClock', 'alarms', [eventHash], eventHash !== null || eventHash !== '', true); 

  useEffect(() => {
    if (!eventInfo.data) { return; }

    setEventData({
      isValid: eventHash === eventInfo.data[0],
      alarmTime: eventInfo.data[1],
      snoozeInterval: eventInfo.data[2],
      snoozeKeyId: eventInfo.data[3],
      rangeStart: eventInfo.data[1].sub(eventInfo.data[2]),
      tooEarly: (new Date(eventInfo.data[1].sub(eventInfo.data[2])*1000)) > Date.now()
    });
  }, [eventInfo.data]);

  return eventData;
}

/**
 * useSnoozeAlarm
 *
 * Will attempt to snooze a particular alarm. If the caller isn't holding the snooze 
 * key the transaction will revert.
 */
export function useSnoozeAlarm(eventHash, errorFunc, successFunc) {
  return useLocksmithWrite('AlarmClock', 'snoozeAlarm',
      [eventHash], eventHash, errorFunc, successFunc);
}
