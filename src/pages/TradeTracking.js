import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { useCapital } from '../pages/CapitalContext';
import { serverTimestamp } from 'firebase/firestore';

const TradeTracking = () => {
  const { refreshCapitalValue, capital } = useCapital();

  useEffect(() => {
    const capitalNum = parseFloat(capital);
    if (!isNaN(capitalNum)) {
      setFormData((prev) => {
        if (!prev.capital || parseFloat(prev.capital) === 0) {
          return {
            ...prev,
            capital: capitalNum.toString(),
            margin: (capitalNum / 3).toFixed(2),
          };
        }
        return prev;
      });
    }
  }, [capital]);

  const [loading, setLoading] = useState(false);

  const initialForm = {
    date: '',
    capital: '',
    margin: '',
    leverage: '5',
    coin: 'FIL',
    type: 'LONG',
    entry: '',
    exit: '',
    sl: '',
    target: '',
    entryReason: 'SUPERTREND, RSI',
    exitReason: 'SUPERTREND, RSI',
    pnl: '',
    status: 'Win',
    mistakes: 'NO',
    goodMoves: 'FOLLOWED STRATEGY'
  };

  const [formData, setFormData] = useState(initialForm);
  const [recentTrades, setRecentTrades] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [suggestions, setSuggestions] = useState({
    coin: [],
    entryReason: [],
    exitReason: [],
    mistakes: [],
    goodMoves: [],
    leverage: []
  });

  const fetchSuggestions = async () => {
    const snapshot = await getDocs(collection(db, 'dailyTrades'));
    const all = snapshot.docs.map(doc => doc.data());
    const extractUnique = (key) => Array.from(new Set(all.map(item => item[key]).filter(Boolean)));
    setSuggestions({
      coin: extractUnique('coin'),
      entryReason: extractUnique('entryReason'),
      exitReason: extractUnique('exitReason'),
      mistakes: extractUnique('mistakes'),
      goodMoves: extractUnique('goodMoves'),
      leverage: extractUnique('leverage'),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (typeof updatedValue === 'string') {
      updatedValue = updatedValue.toUpperCase();
    }

    const updatedForm = {
      ...formData,
      [name]: updatedValue
    };

    if (name === 'capital' && updatedValue) {
      const capitalNum = parseFloat(updatedValue);
      if (!isNaN(capitalNum)) {
        updatedForm.margin = (capitalNum / 3).toFixed(2);
      }
    }

    const { type, entry, exit, margin, leverage } = updatedForm;
    if (type && entry && exit && margin && leverage) {
      const pnl = calcPnL(type, entry, exit, margin, leverage);
      updatedForm.pnl = pnl;
      const pnlNum = parseFloat(pnl);
      if (!isNaN(pnlNum)) {
        updatedForm.status = pnlNum > 0 ? 'WIN' : pnlNum < 0 ? 'LOSS' : 'BREAKEVEN';
      }
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
	  const selectedDate = new Date(formData.date); // e.g. 2025-06-01
	  const now = new Date(); // current time
	  
	  // Combine selected date + current time
	  selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const dataWithTimestamp = {
        ...formData,
        date: Timestamp.fromDate(new Date(formData.date)),
        createdAt: Timestamp.fromDate(selectedDate)          // user date + current time
      };

      const docRef = await addDoc(collection(db, 'dailyTrades'), dataWithTimestamp);
      await setDoc(doc(db, 'dailyTrades', docRef.id), {
        ...dataWithTimestamp,
        id: docRef.id
      });

      if (formData?.draftId) {
        await deleteDoc(doc(db, 'dailyTradeDrafts', formData.draftId));
      }

      const updatedCapital = await refreshCapitalValue();

      setFormData({
        ...initialForm,
        capital: updatedCapital.toString(),
        margin: (updatedCapital / 3).toFixed(2),
      });

      await fetchLastTrades();
      await fetchDrafts();
      await fetchSuggestions();
    } catch (err) {
      console.error('Error adding trade:', err);
    }
    setLoading(false);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
	  const selectedDate = new Date(formData.date); // e.g. 2025-06-01
	  const now = new Date(); // current time
	  
	  // Combine selected date + current time
	  selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const dataWithTimestamp = {
        ...formData,
        date: Timestamp.fromDate(new Date(formData.date)),
        createdAt: serverTimestamp()
      };
      const draftRef = await addDoc(collection(db, 'dailyTradeDrafts'), dataWithTimestamp);
      await setDoc(doc(db, 'dailyTradeDrafts', draftRef.id), {
        ...dataWithTimestamp,
        id: draftRef.id
      });
      setFormData(initialForm);
      await fetchDrafts();
    } catch (err) {
      console.error('Error saving draft:', err);
    }
    setLoading(false);
  };

  const loadDraft = (draft) => {
    const date = draft.date?.toDate?.().toISOString().split('T')[0] || draft.date;
    const capitalValue = draft.capital || refreshCapitalValue.toString();
    setFormData({
      ...draft,
      capital: capitalValue,
      margin: (parseFloat(capitalValue) / 3).toFixed(2),
      date,
      draftId: draft.id
    });
  };

const calcPnL = (type, entry, exit, margin, leverage) => {
  const e1 = parseFloat(entry);
  const e2 = parseFloat(exit);
  const m = parseFloat(margin);
  const l = parseFloat(leverage);

  if ([e1, e2, m, l].some(isNaN)) return '';

  const positionSize = m * l;
  const feeRate = 0.0005; // 0.05% per side
  let grossPnL = 0;

  if (type.toLowerCase() === 'long') {
    grossPnL = (positionSize / e1) * (e2 - e1);
  } else if (type.toLowerCase() === 'short') {
    grossPnL = (positionSize / e2) * (e1 - e2);
  }

  const entryFee = positionSize * feeRate;
  const exitFee = positionSize * feeRate;
  const totalFees = entryFee + exitFee;

  const netPnL = grossPnL - totalFees;
  return netPnL.toFixed(2);
};

  const deleteDraft = async (id) => {
    await deleteDoc(doc(db, 'dailyTradeDrafts', id));
    await fetchDrafts();
  };

  const fetchLastTrades = async () => {
    const q = query(collection(db, 'dailyTrades'), orderBy('createdAt', 'desc'), limit(3));
    const snapshot = await getDocs(q);
    const trades = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date?.toDate?.().toLocaleDateString('en-IN') || data.date
      };
    });
    setRecentTrades(trades);
  };

  const fetchDrafts = async () => {
    const snapshot = await getDocs(collection(db, 'dailyTradeDrafts'));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setDrafts(data);
  };

  useEffect(() => {
    fetchSuggestions();
    fetchLastTrades();
    fetchDrafts();
  }, []);

  const comboBoxFields = ['coin', 'entryReason', 'exitReason', 'mistakes', 'goodMoves', 'leverage'];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Daily Trade Entry</h2>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-box">⏳Processing...Please wait</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow">
        {Object.keys(initialForm).map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-sm font-medium text-gray-700 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            {key === 'type' || key === 'status' ? (
              <select
                name={key}
                value={formData[key]}
                required
                onChange={handleChange}
                className="p-2 rounded border"
              >
                {key === 'type' ? (
                  <>
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </>
                ) : (
                  <>
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                    <option value="BREAKEVEN">BREAKEVEN</option>
                  </>
                )}
              </select>
            ) : key === 'date' ? (
              <input
                type="date"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
                className="p-2 rounded border"
              />
            ) : comboBoxFields.includes(key) ? (
              <>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  list={`${key}-list`}
                  required
                  className="p-2 rounded border"
                />
                <datalist id={`${key}-list`}>
                  {suggestions[key].map((val, idx) => (
                    <option key={idx} value={val} />
                  ))}
                </datalist>
              </>
            ) : (
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
                className="p-2 rounded border"
              />
            )}
          </div>
        ))}

        <div className="flex gap-4 col-span-4">
          <button type="submit" className="submit-btn">
            Submit
          </button>
          <button type="button" onClick={handleSaveDraft} className="submit-btn bg-yellow-500">
            Save as Draft
          </button>
        </div>
      </form>

      {drafts.length > 0 && (
        <>
          <h3 className="mt-6 text-lg font-semibold">Drafts</h3>
          <table className="trade-table">
            <thead>
              <tr>
                {['Date', 'Coin', 'Type', 'Entry', 'Exit', 'P&L', 'Actions'].map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft, index) => (
                <tr key={index}>
                  <td>{draft.date?.toDate?.().toLocaleDateString?.()}</td>
                  <td>{draft.coin}</td>
                  <td>{draft.type}</td>
                  <td>{draft.entry}</td>
                  <td>{draft.exit}</td>
                  <td>{draft.pnl}</td>
                  <td>
                    <button onClick={() => loadDraft(draft)}>Load</button>
                    <button onClick={() => deleteDraft(draft.id)} style={{ marginLeft: '10px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 className="text-lg font-semibold mt-6">Last 3 Trades</h3>
      <table className="trade-table">
        <thead>
          <tr>
            {[
              'Date',
              'Coin',
              'Type',
              'Leverage',
              'Entry',
              'Exit',
              'SL',
              'Target',
              'Status',
              'P&L',
              'Mistakes',
              'GoodMoves'
            ].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentTrades.map((trade, idx) => (
            <tr key={idx}>
              <td>{trade.date}</td>
              <td>{trade.coin}</td>
              <td>{trade.type}</td>
              <td>{trade.leverage}</td>
              <td>{trade.entry}</td>
              <td>{trade.exit}</td>
              <td>{trade.sl}</td>
              <td>{trade.target}</td>
              <td>{trade.status}</td>
              <td>{trade.pnl}</td>
              <td>{trade.mistakes}</td>
              <td>{trade.goodMoves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTracking;
