import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios를 사용하여 API 호출
import '../styles/GameStart.css';
import logo from '../assets/logo.png';
import playIcon from '../assets/play-icon.webp'; // 플레이 아이콘 추가
import socket from '../socket';
import Timer from '../components/Timer'; // Timer 컴포넌트 임포트

const GameStart: React.FC = () => {
    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const navigate = useNavigate();
    const category = params.get('category'); // 쿼리 파라미터에서 카테고리 가져오기

    const [randomItem, setRandomItem] = useState<string | null>(null);
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [script, setScript] = useState<string>('');
    const [keyword, setKeyword] = useState<string | null>(null); // 정답 단어 상태
    const [timer, setTimer] = useState<number>(0);
    const isGameRunning = true;

    // useEffect(() => {
    //     // 카테고리가 존재하면 백엔드 API 호출
    //     if (category) {
    //         axios.post('http://192.249.29.181:3000/keyword', { category })
    //             .then(response => {
    //                 const { keyword } = response.data;
    //                 setRandomItem(keyword); // API로부터 제시어 설정
    //             })
    //             .catch(err => {
    //                 if (err.response && err.response.data && err.response.data.error) {
    //                     setError(err.response.data.error); // 에러 메시지 설정
    //                 } else {
    //                     setError('Failed to fetch keyword.');
    //                 }
    //             });
    //     } else {
    //         setError('Category is missing.');
    //     }
    // }, [category]);
    
    useEffect(() => {
            // 서버로부터 정답 단어 받기
            socket.on("hostPrepare", ({ keyword }) => {
                setKeyword(keyword); // 정답 단어 설정
            });
    
            socket.on("error", (error) => {
                alert(error.message || "오류가 발생했습니다.");
            });

            socket.on('timerUpdate2', ({ remainingTime }) => {
                        setTimer(remainingTime);
                        console.log(remainingTime);
                    });
    
            return () => {
                socket.off("hostPrepare"); // 이벤트 정리
                socket.off('timerUpdate2');
                socket.off("error");
            };
        }, []);

        useEffect(() => {
            socket.on("gameStartReady", ({ message, nickname }) => {
                alert(message); // 시간 초과 메시지 표시
                // navigate(`/game/${roomId}/gameplay`, { state: { nickname, roomId } });
            });
        
            return () => {
                socket.off("gameStartReady");
            };
        }, []);

    // const handleSubmit = () => {
    //     // 설명과 제시어를 함께 GamePlay로 전달
    //     if (input && randomItem) {
    //         navigate(`/game/${roomId}/gameplay?category=${category}`, {
    //             state: { description: input, keyword: randomItem },
    //         });
    //     } else {
    //         alert('설명을 입력해주세요!');
    //     }
    // };
    
    const handleSubmitScript = () => {
            if (!script.trim()) {
                alert('설명을 입력하세요!');
                return;
            }
    
            socket.emit('submitScript', { room: roomId, script });
    
            // socket.on('gameStarted', ({ imageUrl, category }) => {
            //     navigate(`/game/${roomId}/gameplay`, { state: { imageUrl, category, script } });
            // });
            navigate(`/game/${roomId}/gameplay`, { state: {category, script } });
    
            socket.on('error', (error) => {
                alert(error.message || '오류가 발생했습니다.');
            });
        };

    return (
        <div className="game-start">
            <div className="outer-container-GameStart">
            <header>
                    <img src={logo} alt="로고" className="logo" />
                    
                </header>
            <h2>제시어: {keyword || "제시어를 불러오는 중..."}</h2>
            <Timer initialTime={timer} isRunning={isGameRunning} />
            {error ? (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="item-display">
                    
                    <textarea
                        placeholder="제시어를 설명하세요"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                    />
                    <button onClick={handleSubmitScript}>
                    <img src={playIcon} alt="Play Icon" className="button-icon" />
                        게임시작</button>
                </div>
            )}
        </div>
        </div>
    );
};

export default GameStart;