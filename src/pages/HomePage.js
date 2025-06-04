import React from 'react';
export default function HomePage() {
  return (
    <div className="grid">
      <div className="card red">
        <h2>📘 Trading Rules</h2>
        <ul>
          <li>Take only 1-2 high-conviction trades per day</li>
          <li>Stoploss is your best friend — never ignore it</li>
          <li>If SL hits, accept it. No revenge trades</li>
          <li>Don’t chase missed entries</li>
          <li>Mention Entry, Exit, and SL before trade</li>
          <li>Record every trade — good or bad</li>
        </ul>
      </div>

      <div className="card yellow">
        <h2>🌞 Daily Practices</h2>
        <ul>
          <li>Start day with market research</li>
          <li>Stick to plan, not emotions</li>
          <li>Don’t be greedy</li>
          <li>Take break after SL</li>
          <li>End day with journaling</li>
        </ul>
        <blockquote>
          “Set your target. Reach it. Exit with pride — not with greed.”
        </blockquote>
      </div>

      <div className="card green">
        <h2>🎯 My Goals</h2>
        <ul>
          <li>Zero emotional trades per day</li>
          <li>Track win-rate weekly</li>
          <li>90%+ discipline days</li>
          <li>₹25 lakh corpus by 2026</li>
        </ul>
        <blockquote>
          “Strong walls aren’t built in a day — they’re laid, aligned, and tested with patience.”
        </blockquote>
      </div>
    </div>
  );
}
