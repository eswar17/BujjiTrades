import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  setDoc,
  doc,
  orderBy,
} from 'firebase/firestore';

const DailyReview = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [trades, setTrades] = useState([]);
  const [pnlSummary, setPnlSummary] = useState(0);
  const [reviewFields, setReviewFields] = useState({
    mistakes: '',
    goodMoves: '',
    learning: '',
    improvement: '',
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleReviewChange = (e) => {
    setReviewFields({ ...reviewFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const reviewDoc = {
      date: Timestamp.fromDate(new Date(selectedDate)),
      ...reviewFields,
    };

    const reviewRef = collection(db, 'dailyReviews');
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    const reviewQuery = query(
      reviewRef,
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );

    const existing = await getDocs(reviewQuery);

    try {
      if (!existing.empty) {
        const docId = existing.docs[0].id;
        await setDoc(doc(db, 'dailyReviews', docId), reviewDoc); // Replace existing
      } else {
        await addDoc(reviewRef, reviewDoc); // Add new
      }
      alert('Daily Review Saved');
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      if (!selectedDate) return;

      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'dailyTrades'),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tradesData = querySnapshot.docs.map((doc) => doc.data());
      setTrades(tradesData);

      const totalPnl = tradesData.reduce(
        (sum, trade) => sum + (parseFloat(trade.pnl) || 0),
        0
      );
      setPnlSummary(totalPnl);
    };

    fetchTrades();
  }, [selectedDate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Daily Review</h2>
      <input
  type="date"
  value={selectedDate}
  onChange={handleDateChange}
  className="calendar-input"
/>


      {trades.length > 0 ? (
        <>
          <h3 className="text-xl font-semibold mb-2">
            Trades on {selectedDate}
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="trade-table">
  <thead >
    <tr>
      {[
        'Coin', 'Type', 'Entry', 'Exit', 'SL', 'Target', 'Status', 'P&L', 'Mistakes', 'Good Moves'
      ].map((header) => (
        <th key={header}>{header}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {trades.map((trade, i) => (
      <tr key={i} >
        <td >{trade.coin}</td>
        <td >{trade.type}</td>
        <td >{trade.entry}</td>
        <td >{trade.exit}</td>
        <td >{trade.sl}</td>
        <td >{trade.target}</td>
        <td >{trade.status}</td>
        <td >₹{trade.pnl}</td>
        <td >{trade.mistakes}</td>
        <td >{trade.goodMoves}</td>
      </tr>
    ))}
  </tbody>
</table>

            <p className="mt-2 font-semibold">
              Total P&L of Day: ₹{pnlSummary}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 shadow rounded"
          >
            {['mistakes', 'goodMoves', 'learning', 'improvement'].map(
              (field) => (
                <textarea
                  key={field}
                  name={field}
                  placeholder={
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={reviewFields[field]}
                  onChange={handleReviewChange}
                  className="border p-2 rounded h-24"
                />
              )
            )}
            <button
  type="submit"
  className="submit-btn"
>
  Submit
</button>

          </form>
        </>
      ) : (
        selectedDate && (
          <p className="text-red-500">No trades found for selected date.</p>
        )
      )}
    </div>
  );
};

export default DailyReview;
