import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DailyTracking from './pages/DailyTracking';
import DailyReview from './pages/DailyReview';
import MistakeTracker from './pages/MistakeTracker';
import GoodMovesTracker from './pages/GoodMovesTracker';


export default function App() {
  return (
    <Router>
      <div className="layout">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily-tracking" element={<DailyTracking />} />
            <Route path="/daily-review" element={<DailyReview />} />
            <Route path="/mistake-tracker" element={<MistakeTracker />} />
            <Route path="/good-moves-tracker" element={<GoodMovesTracker />} />
            {/* Add more routes here later */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
