import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // 로고 추가
import axios from 'axios';
import placeholderImage from '../assets/placeholder.png'; // 임의의 이미지 추가
import '../styles/GamePlay.css';
import socket from '../socket'; // 분리된 Socket.IO 클라이언트

const GamePlay: React.FC = () => {
    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const location = useLocation();
    const state = location.state as { description: string; keyword: string };
    

    // const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null); // 카테고리 상태 추가
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]); // 채팅 메시지 목록
    const [newMessage, setNewMessage] = useState<string>(''); // 입력 중인 메시지
    const isDevMode = false; // true로 설정하면 실제 API 호출을 막음
    const { script } = location.state || {}; // 초기 상태에서 category와 script 받기
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // useEffect(() => {
    //     if (description) {
    //         if (isDevMode) {
    //             // 개발 모드에서는 임의의 이미지 URL 사용
    //             console.log('개발 모드: 실제 API 호출을 생략합니다.');
    //             setTimeout(() => {
    //                 setImageUrl(placeholderImage); // 로컬 이미지 경 설정
    //             }, 1000); // API 응답 시뮬레이션 (1초 지연)
    //         } else {
    //             // 실제 API 호출
    //             const requestBody = {
    //                 prompt: description, // 설명만 전송
    //                 n: 1, // 이미지 1개 생성 요청
    //                 size: "1024x1024" // 이미지 크기 지정
    //             };

    //             axios
    //                 .post('http://192.249.29.181:3000/generate-image', requestBody)
    //                 .then(response => {
    //                     const { imageUrls } = response.data;
    //                     if (imageUrls && imageUrls.length > 0) {
    //                         setImageUrl(imageUrls[0]); // 생성된 이미지 URL 설정
    //                     } else {
    //                         setError('이미지를 가져오는 데 실패했습니다.');
    //                     }
    //                 })
    //                 .catch((err) => {
    //                     if (err.response && err.response.data && err.response.data.error) {
    //                         setError(err.response.data.error); // 서버로부터 받은 에러 메시지
    //                     } else {
    //                         setError('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    //                     }
    //                 });
    //         }
    //     }
    // }, [description, keyword, isDevMode]);
    
    //채팅 상태관리
    useEffect(() => {
        if (roomId) {
            console.log(`방 ${roomId}에 입장한 상태입니다.`);

            socket.on('gameStarted', ({ imageUrl, category }) => {
                setImageUrl(imageUrl); // 이미지 URL 상태 업데이트
                setCategory(category); // 카테고리 상태 업데이트
                console.log(`게임 시작: 그림 URL (${imageUrl}), 카테고리 (${category}) 수신`);
            });
    
            // 채팅 메시지 수신
            socket.on('chatMessage', (data) => {
                setMessages((prev) => [...prev, `[${data.nickname}]: ${data.message}`]);
                console.log(`채팅 수신 성공: ${roomId}`);
            });

            socket.on("roomMessage", (data) => {
                setMessages((prev) => [...prev, `[알림]: ${data.message}`]); // 시스템 메시지 추가
                console.log(`[Room Message]: ${data.message}`);
            });
    
            return () => {
                socket.off('chatMessage'); // 이벤트 리스너 제거
                socket.off('roomMessage'); // 방 메시지 리스너 제거
            };
        }
    }, [roomId]);


    const sendMessage = () => {
        if (newMessage.trim() !== '' && roomId) {
            // 서버로 메시지 전송
            socket.emit('chatMessage', { room: roomId, message: newMessage });
            console.log(`채팅 입력 성공: ${roomId}`);
            setNewMessage(''); // 입력창 초기화
        }
    };

    return (
        <div className="game-play">
            <div className="outer-container">
                <header>
                    <img src={logo} alt="로고" className="logo" />
                    <h2 className="subtitle">AI로 말해요</h2>
                    <h6>방 ID: {roomId}</h6> {/* 방 ID 표시 */}
                </header>
                <main className="main-container">
                    <div className="image-container">
                        <h1>게임 플레이</h1>
                        <p>카테고리: {category}</p>
                        <p>{script}</p>
                        {error ? (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        ) : imageUrl ? (
                            <div className="image-display">
                                <img src={imageUrl} alt="생성된 이미지" />
                            </div>
                        ) : (
                            <p>이미지를 생성 중입니다...</p>
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