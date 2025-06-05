import React from 'react';
import { Link } from 'react-router-dom'; 

export default function Header() {
  return (
    <header className="header">
      <div className="logo">BujjiTrades</div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/daily-tracking">Daily Tracking</Link>
        <Link to="#">Daily Review</Link>
        <Link to="#">Mistake Tracker</Link>
        <Link to="#">Good Habits Tracker</Link>
        <Link to="#">Weekly Review</Link>
        <Link to="#">Graphs</Link>
      </nav>
      <div className="capital">Capital: ₹1,00,000</div>
    </header>
  );
}