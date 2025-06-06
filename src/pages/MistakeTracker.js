import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

const MistakeTracker = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [mistakeFields, setMistakeFields] = useState({
    coin: '',
    type: 'Long',
    whatWrong: '',
    solution: '',
  });
  const [mistakes, setMistakes] = useState([]);
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [whatWrongSuggestions, setWhatWrongSuggestions] = useState([]);
  const [solutionSuggestions, setSolutionSuggestions] = useState([]);

  const handleChange = (e) => {
    setMistakeFields({ ...mistakeFields, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedDate) return alert('Please select a date first.');

  try {
    // Check if a mistake with same whatWrong + solution exists
    const q = query(
      collection(db, 'mistakeTracker'),
      where('whatWrong', '==', mistakeFields.whatWrong),
      where('solution', '==', mistakeFields.solution)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      alert('This mistake already exists with the same solution.');
      return;
    }

    // Proceed to add if not duplicate
    const data = {
      ...mistakeFields,
      date: Timestamp.fromDate(new Date(selectedDate)),
    };

    await addDoc(collection(db, 'mistakeTracker'), data);
    alert('Mistake logged!');
    setMistakeFields({
      coin: '',
      type: 'Long',
      whatWrong: '',
      solution: '',
    });
    fetchMistakes();
  } catch (error) {
    console.error('Error saving mistake:', error);
  }
};

const fetchMistakes = async () => {
  const q = query(collection(db, 'mistakeTracker'));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => doc.data());

  // Sort by "whatWrong" alphabetically (A-Z)
  data.sort((a, b) => {
    const w1 = a.whatWrong?.toLowerCase() || '';
    const w2 = b.whatWrong?.toLowerCase() || '';
    return w1.localeCompare(w2);
  });

  setMistakes(data);

  // Set unique suggestion lists
  const coins = Array.from(new Set(data.map(m => m.coin).filter(Boolean)));
  const wrongs = Array.from(new Set(data.map(m => m.whatWrong).filter(Boolean)));
  const solutions = Array.from(new Set(data.map(m => m.solution).filter(Boolean)));

  setCoinSuggestions(coins);
  setWhatWrongSuggestions(wrongs);
  setSolutionSuggestions(solutions);
};


  useEffect(() => {
    fetchMistakes();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <h2>Mistake Tracker</h2>

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
          value={mistakeFields.coin}
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
            value={mistakeFields.type}
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
          name="whatWrong"
          placeholder="What went wrong?"
          value={mistakeFields.whatWrong}
          onChange={handleChange}
          required
          list="wrongList"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <datalist id="wrongList">
          {whatWrongSuggestions.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>

        <input
          name="solution"
          placeholder="What is the solution?"
          value={mistakeFields.solution}
          onChange={handleChange}
          required
          list="solutionList"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <datalist id="solutionList">
          {solutionSuggestions.map((item, idx) => (
            <option key={idx} value={item} />
          ))}
        </datalist>

        <button type="submit">Log Mistake</button>
      </form>

      {mistakes.length > 0 && (
        <>
          <h3>All Logged Mistakes</h3>
          <table border="1" cellPadding="8" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Coin</th>
                <th>Type</th>
                <th>What went wrong</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map((m, i) => {
                return (
                  <tr key={i}>
                    <td>{m.coin}</td>
                    <td>{m.type}</td>
                    <td>{m.whatWrong}</td>
                    <td>{m.solution}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default MistakeTracker;
