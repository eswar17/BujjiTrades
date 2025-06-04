import React from 'react';
export default function Header() {
  return (
    <header className="header">
      <div className="logo">BujjiTrades</div>
      <nav className="nav">
        <a href="#">Home</a>
        <a href="#">Daily Tracking</a>
        <a href="#">Daily Review</a>
        <a href="#">Mistake Tracker</a>
        <a href="#">Good Habits Tracker</a>
        <a href="#">Weekly Review</a>
        <a href="#">Graphs</a>
      </nav>
      <div className="capital">Capital: ₹1,00,000</div>
    </header>
  );
}