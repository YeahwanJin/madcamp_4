import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Game.css';
import logo from '../assets/logo.png'; // 로고 추가
import crownIcon from '../assets/crown-icon.png'; // 방장 아이콘
import userIcon from '../assets/user-icon.png'; // 유저 아이콘
import movieIcon from '../assets/movie-icon.png'; // 영화 아이콘
import placeIcon from '../assets/placeIcon.png'; // 지역 아이콘
import proverbIcon from '../assets/proverbIcon.png'; // 속담 아이콘
import feelIcon from '../assets/feelIcon.png'; // 감정 아이콘
import idolIcon from '../assets/idolIcon.png'; // 아이돌 아이콘
import actorIcon from '../assets/actorIcon.png'; // 배우 아이콘
import celebIcon from '../assets/celebIcon.png'; // 유명인 아이콘
import playIcon from '../assets/play-icon.webp'; // 플레이 아이콘 추가
import socket from '../socket';

const Game: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 선택된 카테고리
    const [players, setPlayers] = useState<{ name: string; isHost: boolean }[]>([]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category); // 카테고리 선택
    };
    const { roomId } = useParams(); // URL에서 roomId 가져오기

    useEffect(() => {
            socket.on('participantsUpdated', (data) => {
                setPlayers(data.participants);
            });
    
            return () => {
                socket.off('participantsUpdated');
            };
        }, []);

    const handleStartGame = () => {
            if (selectedCategory) {
                socket.emit('startGame', { room: roomId, category: selectedCategory });
                navigate(`/game/${roomId}/game-start`, { state: { selectedCategory } });
            } else {
                alert('카테고리를 선택하세요!');
            }
        };



    return (
        <div className="game">
            <div className="outer-container">
            <header className="game-header">
                <img src={logo} alt="로고" className="logo" />
                <h2 className="subtitle">AI로 말해요</h2>
                <h3 className="h-game3">방 ID: {roomId}</h3> {/* 방 ID 표시 */}
            </header>
            <div className="content">
                {/* 왼쪽: 유저 리스트 */}
                <div className="left-container">
                    <h3>플레이어 목록</h3>
                    <div className="player-list">
                        {players.map((player, index) => (
                            <div key={index} className="player-item">
                                <span className="player-name">{player.name}</span>
                                <img
                                    src={player.isHost ? crownIcon : userIcon}
                                    alt={player.isHost ? '방장 아이콘' : '유저 아이콘'}
                                    className="player-icon"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오른쪽: 게임 모드 선택 */}
                <div className="right-container">
                    <h3>게임 모드 선택</h3>
                    <div className="mode-grid">
                        <div
                            className={`mode-item ${selectedCategory === '영화' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('영화')}
                        >
                            <img src={movieIcon} alt="영화 아이콘" className="mode-icon" />
                            영화
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '지역' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('노래')}
                        >
                            <img src={placeIcon} alt="지역 아이콘" className="mode-icon" />
                            지역
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '속담' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('속담담')}
                        >
                            <img src={proverbIcon} alt="속담 아이콘" className="mode-icon" />
                            속담
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '감정' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('감정')}
                        >
                            <img src={feelIcon} alt="감정 아이콘" className="mode-icon" />
                            감정
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '아이돌' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('아이돌돌')}
                        >
                            <img src={idolIcon} alt="아이돌 아이콘" className="mode-icon" />
                            아이돌
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '배우' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('배우')}
                        >
                            <img src={actorIcon} alt="아이돌 아이콘" className="mode-icon" />
                            배우
                        </div>
                        <div
                            className={`mode-item ${selectedCategory === '유명인' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('유명인')}
                        >
                            <img src={celebIcon} alt="유명인 아이콘" className="mode-icon" />
                            유명인
                        </div>
                    </div>
                    <button className="start-button" onClick={handleStartGame}>
                    <img src={playIcon} alt="Play Icon" className="button-icon" />
                        시작
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Game;
