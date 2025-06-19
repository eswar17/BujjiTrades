import React from 'react';
import { Link } from 'react-router-dom';
import { useCapital } from '../pages/CapitalContext';

export default function Header() {
  const { capital } = useCapital();

  return (
    <header className="header">
      <div className="logo">BujjiTrades</div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/trade-tracking">Trade Tracking</Link>
        <Link to="/daily-review">Daily Review</Link>
        <Link to="/mistake-tracker">Mistake Tracker</Link>
        <Link to="/good-moves-tracker">Good Moves Tracker</Link>
        <Link to="#">Weekly Review</Link>
        <Link to="/metrics">Metrics</Link>
      </nav>
      <div className="capital">Capital: ₹{Number(capital || 0).toLocaleString()}</div>
    </header>
  );
}
