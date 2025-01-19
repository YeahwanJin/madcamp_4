import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import GameStart from './components/GameStart'; // GameStart 컴포넌트 추가
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
                <Route path="/game-start" element={<GameStart />} /> {/* 새 경로 */}
            </Routes>
        </Router>
    );
}

export default App;
