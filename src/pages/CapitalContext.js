import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const CapitalContext = createContext();

export const CapitalProvider = ({ children }) => {
  const [capital, setCapital] = useState(0);

  const refreshCapital = async () => {
    const q = query(collection(db, 'dailyTrades'), orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    const latest = snapshot.docs[0]?.data();
    if (latest) {
      const newCapital = parseFloat(latest.capital) + (parseFloat(latest.pnl) || 0);
      setCapital(newCapital);
    }
  };

  useEffect(() => {
    refreshCapital();
  }, []);

  return (
    <CapitalContext.Provider value={{ capital, refreshCapital }}>
      {children}
    </CapitalContext.Provider>
  );
};

export const useCapital = () => useContext(CapitalContext);
