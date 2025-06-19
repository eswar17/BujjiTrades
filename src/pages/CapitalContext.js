import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import {
    db
} from '../firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';

const CapitalContext = createContext();

export const CapitalProvider = ({
    children
}) => {
    const [capital, setCapital] = useState(0);

const refreshCapital = async () => {
  const q = query(collection(db, 'dailyTrades'), orderBy('createdAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    setCapital(0); // ✅ No trades? Set capital to zero!
    return 0;
  }

  const latest = snapshot.docs[0]?.data();
  console.log("latest.capital : "+latest.capital );
  console.log("latest.pnl : "+latest.capital );
  const newCapital = parseFloat(latest.capital) + (parseFloat(latest.pnl) || 0);
  setCapital(newCapital);
  return newCapital;
};



    useEffect(() => {
        refreshCapital();
    }, []);

    return ( <
        CapitalContext.Provider value = {
            {
                capital,
                refreshCapital
            }
        } > {
            children
        } <
        /CapitalContext.Provider>
    );
};

export const useCapital = () => {
  const { capital, refreshCapital } = useContext(CapitalContext);
  return {
    capital,
    refreshCapitalValue: refreshCapital
  };
};
