import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';

const GoodMovesTracker = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [goodMoveFields, setGoodMoveFields] = useState({
    coin: '',
    type: 'Long',
    whatRight: '',
    reason: '',
  });
  const [goodMoves, setGoodMoves] = useState([]);
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [whatRightSuggestions, setWhatRightSuggestions] = useState([]);
  const [reasonSuggestions, setReasonSuggestions] = useState([]);

  const handleChange = (e) => {
    setGoodMoveFields({ ...goodMoveFields, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) return alert('Please select a date.');

    try {
      const q = query(
        collection(db, 'goodMovesTracker'),
        where('whatRight', '==', goodMoveFields.whatRight),
        where('reason', '==', goodMoveFields.reason)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert('This good move is already logged.');
        return;
      }

      const data = {
        ...goodMoveFields,
        date: Timestamp.fromDate(new Date(selectedDate)),
      };

      await addDoc(collection(db, 'goodMovesTracker'), data);
      alert('Good move logged!');
      setGoodMoveFields({
        coin: '',
        type: 'Long',
        whatRight: '',
        reason: '',
      });
      fetchGoodMoves();
    } catch (error) {
      console.error('Error saving good move:', error);
    }
  };

  const fetchGoodMoves = async () => {
    const q = query(collection(db, 'goodMovesTracker'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());

    data.sort((a, b) =>
      (a.whatRight?.toLowerCase() || '').localeCompare(b.whatRight?.toLowerCase() || '')
    );

    setGoodMoves(data);

    const coins = [...new Set(data.map(m => m.coin).filter(Boolean))];
    const rights = [...new Set(data.map(m => m.whatRight).filter(Boolean))];
    const reasons = [...new Set(data.map(m => m.reason).filter(Boolean))];

    setCoinSuggestions(coins);
    setWhatRightSuggestions(rights);
    setReasonSuggestions(reasons);
  };

  useEffect(() => {
    fetchGoodMoves();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <h2>Good Moves Tracker</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          required
          style={{ marginBottom: '10px', display: 'block' }}
        />

        <input
          name="coin"
          placeholder="Coin"
          value={goodMoveFields.coin}
          onChange={handleChange}
          required
          list="coinList"
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <datalist id="coinList">
          {coinSuggestions.map((coin, idx) => (
            <option key={idx} value={coin} />
          ))}
        </datalist>

        <label>
          Type:
          <select
            name="type"
            value={goodMoveFields.type}
            onChange={handleChange}
            required
            style={{ marginLeft: '10px' }}
          >
            <option>Long</option>
            <option>Short</option>
          </select>
        </label>

        <br /><br />

        <input
          name="whatRight"
          placeholder="What went right?"
          value={goodMoveFields.whatRight}
          onChange={handleChange}
          required
          list="rightList"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <datalist id="rightList">
          {whatRightSuggestions.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>

        <input
          name="reason"
          placeholder="Reason it worked?"
          value={goodMoveFields.reason}
          onChange={handleChange}
          required
          list="reasonList"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <datalist id="reasonList">
          {reasonSuggestions.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>

        <button type="submit">Log Good Move</button>
      </form>

      {goodMoves.length > 0 && (
        <>
          <h3>All Logged Good Moves</h3>
          <table border="1" cellPadding="8" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Coin</th>
                <th>Type</th>
                <th>What went right</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {goodMoves.map((m, i) => (
                <tr key={i}>
                  <td>{m.coin}</td>
                  <td>{m.type}</td>
                  <td>{m.whatRight}</td>
                  <td>{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default GoodMovesTracker;
