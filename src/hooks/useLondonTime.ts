import { useState, useEffect } from 'react';

export default function useLondonTime() {
  const [time, setTime] = useState('00:00');
  useEffect(() => {
    function update() {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}
