import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { useCapital } from '../pages/CapitalContext';

export default function Header() {
  const { capital } = useCapital();
  const [setCapital] = useState(0);

  useEffect(() => {
    const fetchLatestCapital = async () => {
      try {
        const q = query(
          collection(db, 'dailyTrades'),
          orderBy('date', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const cap = parseFloat(data.capital || 0);
          const pnl = parseFloat(data.pnl || 0);
          setCapital(cap + pnl);
        }
      } catch (error) {
        console.error('Error fetching capital:', error);
      }
    };

    fetchLatestCapital();
  }, []);

  return (
    <header className="header">
      <div className="logo">BujjiTrades</div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/daily-tracking">Trade Tracking</Link>
        <Link to="/daily-review">Daily Review</Link>
        <Link to="/mistake-tracker">Mistake Tracker</Link>
        <Link to="/good-moves-tracker">Good Moves Tracker</Link>
        <Link to="#">Weekly Review</Link>
        <Link to="/metrics">Metrics</Link>
      </nav>
      <div className="capital">Capital: ₹{capital.toLocaleString()}</div>
    </header>
  );
}
