import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import GameStart from './components/GameStart';
import GamePlay from './components/GamePlay';
import AnimatedRoutes from './components/AnimatedRoutes'; // AnimatedRoutes 임포트

function App() {
    return (
        <Router>
            <AnimatedRoutes /> {/* AnimatedRoutes를 Router 안에 배치 */}
        </Router>
    );
}

export default App;
