import React from 'react';
import { Link } from 'react-router-dom'; 

export default function Header() {
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
        <Link to="#">Metrics</Link>
      </nav>
      <div className="capital">Capital: ₹1,00,000</div>
    </header>
  );
}