import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/GamePlay.css';
import socket from '../socket';

const GamePlay: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const { script } = location.state || {}; // 초기 상태에서 script만 받기
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null); // 카테고리 상태 추가
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    useEffect(() => {
        if (roomId) {
            console.log(`방 ${roomId}에 입장한 상태입니다.`);

            // `gameStarted` 이벤트 등록: 그림 URL과 카테고리 모두 받음
            socket.on('gameStarted', ({ imageUrl, category }) => {
                setImageUrl(imageUrl); // 이미지 URL 상태 업데이트
                setCategory(category); // 카테고리 상태 업데이트
                console.log(`게임 시작: 그림 URL (${imageUrl}), 카테고리 (${category}) 수신`);
            });

            // 채팅 메시지 수신
            socket.on('chatMessage', (data) => {
                setMessages((prev) => [...prev, `[${data.nickname}]: ${data.message}`]);
            });

            socket.on('roomMessage', (data) => {
                setMessages((prev) => [...prev, `[알림]: ${data.message}`]);
            });

            // 컴포넌트 언마운트 시 이벤트 제거
            return () => {
                socket.off('gameStarted');
                socket.off('chatMessage');
                socket.off('roomMessage');
            };
        }
    }, [roomId]);

    const sendMessage = () => {
        if (newMessage.trim() !== '' && roomId) {
            socket.emit('chatMessage', { room: roomId, message: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="game-play">
            <div className="outer-container">
                <header>
                    <img src={logo} alt="로고" className="logo" />
                    <h2 className="subtitle">AI로 말해요</h2>
                    <h6>방 ID: {roomId}</h6>
                </header>
                <main className="main-container">
                    <div className="image-container">
                        <h1>게임 플레이</h1>
                        <p>카테고리: {category}</p>
                        <p>설명: {script}</p>
                        {error ? (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        ) : imageUrl ? (
                            <div className="image-display">
                                <img src={imageUrl} alt="생성된 이미지" />
                            </div>
                        ) : (
                            <p>이미지를 기다리고 있습니다...</p>
                        )}
                    </div>
                    <div className="chat-container">
                        <h3>채팅</h3>
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="chat-message">
                                    {msg}
                                </div>
                            ))}
                        </div>
                        <div className="chat-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="메시지를 입력하세요"
                            />
                            <button onClick={sendMessage}>전송</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GamePlay;