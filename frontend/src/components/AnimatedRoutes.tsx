import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from '../pages/Home';
import Game from '../pages/Game';
import GameStart from '../components/GameStart';
import GamePlay from '../components/GamePlay';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                {/* Home 컴포넌트는 애니메이션 없이 렌더링 */}
                <Route path="/" element={<Home />} />

                {/* Game 컴포넌트에만 애니메이션 적용 */}
                <Route
                    path="/game/:roomId"
                    element={
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Game />
                        </motion.div>
                    }
                />

                {/* 나머지 라우트는 애니메이션 없이 렌더링 */}
                <Route path="/game/:roomId/game-start" element={<GameStart />} />
                <Route path="/game/:roomId/gameplay" element={<GamePlay />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
