import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Game.css';
import logo from '../assets/logo.png'; // 로고 추가
import crownIcon from '../assets/crown-icon.png'; // 방장 아이콘
import userIcon from '../assets/user-icon.png'; // 유저 아이콘
import movieIcon from '../assets/movie-icon.png'; // 영화 아이콘
import musicIcon from '../assets/music-icon.png'; // 노래 아이콘
import playIcon from '../assets/play-icon.webp'; // 플레이 아이콘 추가

const Game: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 선택된 카테고리
    const [players] = useState([
        { name: 'yehwan', isHost: true },
        { name: 'guest1', isHost: false },
        { name: 'guest2', isHost: false },
    ]); // 플레이어 샘플 데이터

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category); // 카테고리 선택
    };
    const { roomId } = useParams(); // URL에서 roomId 가져오기

    const handleStartGame = () => {
        if (selectedCategory) {
            // 현재 방 ID를 URL에서 가져오거나 관리 중인 방 ID 사용
            const roomId = window.location.pathname.split('/')[2]; // URL에서 roomId 추출
            if (roomId) {
                // 선택된 카테고리로 이동
                navigate(`/game/${roomId}/game-start?category=${selectedCategory}`);
            } else {
                alert('유효한 방 ID를 찾을 수 없습니다.');
            }
        } else {
            alert('카테고리를 선택해주세요!');
        }
    };



    return (
        <div className="game">
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
                            className={`mode-item ${selectedCategory === '노래' ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect('노래')}
                        >
                            <img src={musicIcon} alt="노래 아이콘" className="mode-icon" />
                            노래
                        </div>
                    </div>
                    <button className="start-button" onClick={handleStartGame}>
                    <img src={playIcon} alt="Play Icon" className="button-icon" />
                        시작
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Game;
