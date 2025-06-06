// DailyTracking.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const DailyTracking = () => {
  const initialForm = {
    date: '', capital: '', margin: '', leverage: '',
    coin: '', type: 'Long',entry: '', exit: '', sl: '', target: '',
    entryReason: '', exitReason: '', pnl: '', status: 'Win', mistakes: '', goodMoves: ''
  };

  const fieldLabels = {
    date: 'Date', capital: 'Capital', margin: 'Margin', leverage: 'Leverage',
    coin: 'Coin', type: 'Type', entry: 'Entry Price', exit: 'Exit Price', sl: 'Stop Loss',
    target: 'Target', entryReason: 'Entry Reason', exitReason: 'Exit Reason', pnl: 'P&L',
     status: 'Status', mistakes: 'Mistakes', goodMoves: 'Good Moves'
  };

  const [formData, setFormData] = useState(initialForm);
  const [recentTrades, setRecentTrades] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataWithTimestamp = {
  ...formData,
  date: Timestamp.fromDate(new Date(formData.date))  // 👈 accurate date
};
await addDoc(collection(db, 'dailyTrades'), dataWithTimestamp);

      setFormData(initialForm);
      fetchLastTrades();
    } catch (err) {
      console.error('Error adding document:', err);
    }
  };

const fetchLastTrades = async () => {
  const q = query(collection(db, 'dailyTrades'), orderBy('date', 'desc'), limit(3));
  const querySnapshot = await getDocs(q);
  const trades = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      date: data.date?.toDate 
        ? data.date.toDate().toLocaleDateString('en-IN')  // timestamp case
        : data.date                                           // old string case
    };
  });
  setRecentTrades(trades);
};

  useEffect(() => {
    fetchLastTrades();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Daily Trade Entry</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow">
        {Object.keys(initialForm).map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-sm font-medium text-gray-700 mb-1">
              {fieldLabels[key]}
            </label>
            {key === 'type' || key === 'status' ? (
              <select name={key} value={formData[key]} required onChange={handleChange} className="p-2 rounded border">
                {key === 'type' ? (
                  <>
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </>
                ) : (
                  <>
                    <option value="Win">Win</option>
                    <option value="Loss">Loss</option>
                    <option value="BreakEven">BreakEven</option>
                  </>
                )}
              </select>
            ) : key === 'date' ? (
              <input type="date" required name={key} value={formData[key]} onChange={handleChange} className="p-2 rounded border" />
            ) : (
              <input type="text" required name={key} value={formData[key]} onChange={handleChange} className="p-2 rounded border" />
            )}
          </div>
        ))}
            <button
  type="submit"
  className="submit-btn"
>
  Submit
</button>
      </form>

<h3 style={{ fontSize: '18px', marginTop: '30px' }}>Last 3 Trades</h3>
      <table className="trade-table">
        <thead>
          <tr>
            {['Date','Coin','Type','Leverage','Entry','Exit','SL','Target','Status','P&L','Mistakes','GoodMoves'].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentTrades.map((trade, index) => (
            <tr key={index}>
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

export default DailyTracking;
