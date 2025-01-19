import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/GameStart.css';

// 제시어 목록
const movies = ['신세계', '기생충', '타짜', '베테랑'];
const songs = ['좋은 날', '소주 한 잔', '아로하', '벚꽃 엔딩'];

const GameStart: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const category = params.get('category'); // 쿼리 파라미터에서 카테고리 가져오기

    const [randomItem, setRandomItem] = useState<string | null>(null);
    const [input, setInput] = useState<string>('');

    useEffect(() => {
        // 카테고리에 따라 랜덤 제시어 선택
        if (category === '영화') {
            setRandomItem(movies[Math.floor(Math.random() * movies.length)]);
        } else if (category === '노래') {
            setRandomItem(songs[Math.floor(Math.random() * songs.length)]);
        }
    }, [category]);

    return (
        <div className="game-start">
            <h1>게임 시작: {category}</h1>
            {randomItem && (
                <div className="item-display">
                    <h2>제시어: {randomItem}</h2>
                    <textarea
                        placeholder="제시어를 설명하세요"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default GameStart;
