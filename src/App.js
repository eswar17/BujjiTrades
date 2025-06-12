import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DailyTracking from './pages/DailyTracking';
import DailyReview from './pages/DailyReview';
import MistakeTracker from './pages/MistakeTracker';
import GoodMovesTracker from './pages/GoodMovesTracker';
import Metrics from './pages/Metrics';
import { CapitalProvider } from './pages/CapitalContext';
import { Navigate } from 'react-router-dom';

export default function App() {
  return (
    <div className="layout">
      <CapitalProvider>
        <Header />
        <main className="main">
          <Routes>
		    <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/daily-tracking" element={<DailyTracking />} />
            <Route path="/daily-review" element={<DailyReview />} />
            <Route path="/mistake-tracker" element={<MistakeTracker />} />
            <Route path="/good-moves-tracker" element={<GoodMovesTracker />} />
            <Route path="/metrics" element={<Metrics />} />
          </Routes>
        </main>
        <Footer />
      </CapitalProvider>
    </div>
  );
}
