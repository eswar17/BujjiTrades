import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

const Metrics = () => {
  const [filters, setFilters] = useState({
    coin: '',
    type: '',
    status: '',
    from: '',
    to: '',
  });

  const [distinctCoins, setDistinctCoins] = useState([]);
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getUniqueCoins = async () => {
    const snapshot = await getDocs(collection(db, 'dailyTrades'));
    const coins = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.coin) coins.add(data.coin);
    });
    setDistinctCoins(Array.from(coins));
  };

  const fetchMetrics = async () => {
    let q = collection(db, 'dailyTrades');
    const conditions = [];

    if (filters.coin) conditions.push(where('coin', '==', filters.coin));
    if (filters.type) conditions.push(where('type', '==', filters.type));
    if (filters.status) conditions.push(where('status', '==', filters.status));

    if (filters.from && filters.to) {
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(where('date', '>=', Timestamp.fromDate(fromDate)));
      conditions.push(where('date', '<=', Timestamp.fromDate(toDate)));
    }

    let qFiltered = conditions.reduce((acc, curr) => query(acc, curr), q);
    const snapshot = await getDocs(qFiltered);
    const result = snapshot.docs.map(doc => doc.data());
    setTrades(result);

    const summary = {
      totalTrades: result.length,
      winning: result.filter(t => t.status === 'Win').length,
      losing: result.filter(t => t.status === 'Loss').length,
      netProfit: result.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0),
      mistakes: result.filter(t => t.mistakes?.trim()).length,
      goodMoves: result.filter(t => t.goodMoves?.trim()).length,
    };
    summary.successRate = summary.totalTrades
      ? ((summary.winning / summary.totalTrades) * 100).toFixed(2) + '%'
      : '0%';
    setSummary(summary);
  };

  useEffect(() => {
    getUniqueCoins();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <h2>Metrics</h2>

      <div style={{
        display: 'flex', gap: '20px', marginBottom: '30px',
        alignItems: 'flex-end', flexWrap: 'wrap'
      }}>
        {[
          { label: 'Coin', name: 'coin', type: 'select', options: ['All Coins', ...distinctCoins] },
          { label: 'From Date', name: 'from', type: 'date' },
          { label: 'To Date', name: 'to', type: 'date' },
          { label: 'Position', name: 'type', type: 'select', options: ['All Types', 'Long', 'Short'] },
          { label: 'Status', name: 'status', type: 'select', options: ['All Status', 'Win', 'Loss'] },
        ].map((field, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
            <label style={{ fontWeight: '500', marginBottom: '5px' }}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={filters[field.name]}
                onChange={handleChange}
                style={{ padding: '6px' }}
              >
                {field.options.map((opt, i) => (
                  <option key={i} value={opt.includes('All') ? '' : opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                name={field.name}
                value={filters[field.name]}
                onChange={handleChange}
                style={{ padding: '6px' }}
              />
            )}
          </div>
        ))}

        <button
          onClick={() => {
            if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
              alert('From Date should not be greater than To Date');
              return;
            }
            fetchMetrics();
          }}
          style={{
            padding: '10px 20px',
            background: '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            height: '40px',
            cursor: 'pointer'
          }}
        >
          Fetch
        </button>

        <button
          onClick={() => {
            setFilters({ coin: '', type: '', status: '', from: '', to: '' });
            setTrades([]);
            setSummary(null);
          }}
          style={{
            padding: '10px 20px',
            background: '#e2e8f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            height: '40px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      {summary && (
        <div style={{ marginBottom: '30px' }}>
  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>📊 Summary</h3>

  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
    <div style={{ background: '#e2e8f0', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Total Trades</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.totalTrades}</div>
    </div>

    <div style={{ background: '#d1fae5', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Winning Trades</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'green' }}>{summary.winning}</div>
    </div>

    <div style={{ background: '#fee2e2', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Losing Trades</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'red' }}>{summary.losing}</div>
    </div>

    <div style={{ background: '#dbeafe', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Success Rate</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>{summary.successRate}</div>
    </div>

    <div style={{ background: '#e0f2fe', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Net Profit</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f766e' }}>₹{summary.netProfit}</div>
    </div>

    <div style={{ background: '#fef9c3', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Mistakes</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.mistakes}</div>
    </div>

    <div style={{ background: '#dcfce7', padding: '12px 12px', borderRadius: '8px', minWidth: '160px' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Good Moves</div>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{summary.goodMoves}</div>
    </div>
  </div>
</div>

      )}

      {trades.length > 0 && (
        <table border="1" cellPadding="6" width="100%">
          <thead>
            <tr>
              {['Date', 'Coin', 'Type', 'Status', 'Mistake', 'Good Move', 'Margin', 'Leverage', 'Entry', 'Exit', 'P&L'].map((head, idx) => (
                <th key={idx}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                <td>{t.date?.toDate?.().toLocaleDateString?.()}</td>
                <td>{t.coin}</td>
                <td>{t.type}</td>
                <td style={{ color: t.status === 'Win' ? 'green' : 'red', fontWeight: 'bold' }}>{t.status}</td>
                <td>{t.mistakes}</td>
                <td>{t.goodMoves}</td>
                <td style={{ textAlign: 'right' }}>{t.margin}</td>
                <td style={{ textAlign: 'right' }}>{t.leverage}</td>
                <td style={{ textAlign: 'right' }}>{t.entry}</td>
                <td style={{ textAlign: 'right' }}>{t.exit}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{t.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Metrics;
