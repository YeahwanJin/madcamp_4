import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import GameStart from './components/GameStart';
import GamePlay from './components/GamePlay';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:roomId" element={<Game />} /> {/* 방 ID 포함 */}
                <Route path="/game/:roomId/game-start" element={<GameStart />} /> {/* 동적 라우팅 */}
                <Route path="/game/:roomId/gameplay" element={<GamePlay />} /> {/* 동적 라우팅 */}
            </Routes>
        </Router>
    );
}

export default App;
