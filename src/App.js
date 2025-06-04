import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}