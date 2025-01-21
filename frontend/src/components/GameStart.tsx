import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios를 사용하여 API 호출
import '../styles/GameStart.css';
import logo from '../assets/logo.png';
import playIcon from '../assets/play-icon.webp'; // 플레이 아이콘 추가

const GameStart: React.FC = () => {
    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const navigate = useNavigate();
    const category = params.get('category'); // 쿼리 파라미터에서 카테고리 가져오기

    const [randomItem, setRandomItem] = useState<string | null>(null);
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // 카테고리가 존재하면 백엔드 API 호출
        if (category) {
            axios.post('http://192.249.29.181:3000/keyword', { category })
                .then(response => {
                    const { keyword } = response.data;
                    setRandomItem(keyword); // API로부터 제시어 설정
                })
                .catch(err => {
                    if (err.response && err.response.data && err.response.data.error) {
                        setError(err.response.data.error); // 에러 메시지 설정
                    } else {
                        setError('Failed to fetch keyword.');
                    }
                });
        } else {
            setError('Category is missing.');
        }
    }, [category]);

    const handleSubmit = () => {
        // 설명과 제시어를 함께 GamePlay로 전달
        if (input && randomItem) {
            navigate(`/game/${roomId}/gameplay?category=${category}`, {
                state: { description: input, keyword: randomItem },
            });
        } else {
            alert('설명을 입력해주세요!');
        }
    };
    

    return (
        <div className="game-start">
            <div className="outer-container">
            <header>
                    <img src={logo} alt="로고" className="logo" />
                    
                </header>
            <h2>제시어: {randomItem}</h2>
            {error ? (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            ) : (
                randomItem && (
                    <div className="item-display">
                        
                        <textarea
                            placeholder="제시어를 설명하세요"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button onClick={handleSubmit}>
                        <img src={playIcon} alt="Play Icon" className="button-icon" />
                            게임시작</button>
                    </div>
                )
            )}
        </div>
        </div>
    );
};

export default GameStart;