// src/context/CapitalContext.js

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const CapitalContext = createContext();

export const useCapital = () => useContext(CapitalContext);

export const CapitalProvider = ({ children }) => {
  const [capital, setCapital] = useState(0);

  const fetchCapital = async () => {
    const q = query(collection(db, 'dailyTrades'), orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const cap = parseFloat(data.capital || 0);
      const pnl = parseFloat(data.pnl || 0);
      setCapital(cap + pnl); // latest capital = capital + pnl
    }
  };

  useEffect(() => {
    fetchCapital();
  }, []);

  return (
    <CapitalContext.Provider value={{ capital, refreshCapital: fetchCapital }}>
      {children}
    </CapitalContext.Provider>
  );
};
