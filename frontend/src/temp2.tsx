import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // 로고 추가
import axios from 'axios';
import placeholderImage from '../assets/placeholder.png'; // 임의의 이미지 추가
import '../styles/GamePlay.css';
import socket from '../socket'; // 분리된 Socket.IO 클라이언트
import Timer from '../components/Timer'; // Timer 컴포넌트 임포트

const GamePlay: React.FC = () => {
    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const location = useLocation();
    const state = location.state as { description: string; keyword: string };
    const [scores, setScores] = useState<{ nickname: string; earnedScore: number; totalScore: number }[]>([]);
    const [isHost, setIsHost] = useState<boolean>(false); // 호스트 여부 상태
    const [hasStartedGame, setHasStartedGame] = useState<boolean>(false); // 게임 시작 버튼이 처음에만 뜨게 하기 위한 상태
    const [gameStatus, setGameStatus] = useState<string>(''); // 게임 상태 메시지
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string>(''); // 닉네임 상태 추가
    const [category, setCategory] = useState<string | null>(null); // 카테고리 상태 추가
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]); // 채팅 메시지 목록
    const [newMessage, setNewMessage] = useState<string>(''); // 입력 중인 메시지
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [timer, setTimer] = useState<number>(30); // 타이머 상태 추가
    const [participants, setParticipants] = useState<
        { nickname: string; totalScore: number }[]
    >([]);
    const [host, setHost] = useState<string>("");
    const [isGameEnded, setIsGameEnded] = useState<boolean>(false); // 게임 종료 여부

    useEffect(() => {
        if (roomId) {
            console.log(`방 ${roomId}에 입장한 상태입니다.`);

            socket.on('gameStarted', ({ imageUrl, category }) => {
                setImageUrl(imageUrl || placeholderImage); // 이미지 URL 상태 업데이트
                setCategory(category || '??'); // 카테고리 상태 업데이트
                setTimer(30); // 수정1
                setHasStartedGame(true); // 게임 시작 버튼을 숨기기 위해 설정
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

    useEffect(() => {
        socket.on('gameEnded', ({ message, scores, nextHost }) => {
            console.log('게임 종료 이벤트 수신:');
            console.log('메시지:', message);
            console.log('점수:', scores);
            console.log('다음 호스트 ID:', nextHost);

            setMessages((prev) => [...prev, `[알림]: 게임이 종료되었습니다`]); // 시스템 메시지 추가
            setScores(scores); // 점수 업데이트
            setIsGameEnded(true); // 게임 종료 상태 설정
        });

        socket.on("hostTransition", ({ roomId, message }) => {
            console.log(roomId);
            alert(message);
            setIsHost(true);
        });

        return () => {
            console.log('게임 종료 이벤트 리스너 제거');
            socket.off('gameEnded');
            socket.off("hostTransition");
        };
    }, []);

    useEffect(() => {
        const handleTimerUpdate = ({ remainingTime }: { remainingTime: number }) => {
            setTimer(remainingTime);
            console.log(remainingTime);
        };

        socket.on('timerUpdate', handleTimerUpdate);

        return () => {
            socket.off('timerUpdate', handleTimerUpdate);
        };
    }, []);

    useEffect(() => {
        socket.on("chatError", (data) => {
            alert(data.message); // 알림 표시
        });

        return () => {
            socket.off("chatError");
        };
    }, []);

    useEffect(() => {
        socket.emit("getParticipants", roomId);

        socket.on("participantsUpdated", ({ participants, host }) => {
            setParticipants(participants); // 참가자와 점수 상태 업데이트
            setHost(host); // 호스트 정보 업데이트
        });

        return () => {
            socket.off("participantsUpdated");
        };
    }, []);

    const handleLeaveRoom = () => {
        if (roomId) {
            socket.emit("leaveRoom", { room: roomId });
            navigate("/");
        }
    };

    const handleStartGame = () => {
        socket.emit("startGame", { room: roomId });
        setHasStartedGame(true); // 버튼을 숨기기 위해 설정
    };

    const sendMessage = () => {
        if (newMessage.trim() !== '' && roomId) {
            socket.emit('chatMessage', { room: roomId, message: newMessage });
            console.log(`채팅 입력 성공: ${roomId}`);
            setTimer(0); // 타이머를 0으로 설정
            setNewMessage(''); // 입력창 초기화
        }
    };

    const handleRestartGame = () => {
        setIsGameEnded(false); // 게임 종료 상태 초기화
        navigate(`/game/${roomId}`); // Game 페이지로 이동
    };

    return (
        <div className="game-play">
            <div className="outer-container">
                <header>
                    <img src={logo || placeholderImage} alt="로고" className="logo" />
                    <h2 className="subtitle">AI로 말해요</h2>
                    <h6>방 ID: {roomId}</h6> {/* 방 ID 표시 */}
                    <Timer initialTime={timer} isRunning={isGameRunning} />
                    <button onClick={handleLeaveRoom} className="leave-room-button">
                        방 나가기
                    </button>
                    {isHost && !hasStartedGame && (
                        <div className="game-start">
                            <button onClick={handleStartGame} className="start-button">
                                게임 시작
                            </button>
                        </div>
                    )}
                    {isGameEnded && isHost && (
                        <div className="game-restart">
                            <h3>게임이 종료되었습니다.</h3>
                            <button onClick={handleRestartGame} className="restart-button">
                                게임 재시작
                            </button>
                        </div>
                    )}
                </header>
                <main className="main-container">
                    <div className="participants-list">
                        <h3>참가자 목록</h3>
                        {participants
                            .sort((a, b) => b.totalScore - a.totalScore) // 점수 내림차순 정렬
                            .map((participant, index) => (
                                <div key={index} className="participant-item">
                                    <p>
                                        {index + 1}. {participant.nickname}{" "}
                                        {participant.nickname === host && "(호스트)"}
                                    </p>
                                    <p>점수: {participant.totalScore}점</p>
                                </div>
                            ))}
                    </div>

                    <div className="image-container">
                        <h1>게임 플레이</h1>
                        <p>카테고리: {category || '??'}</p>
                        <p>{state?.description || ''}</p>
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

            {isHost ? (
                <p>새로운 라운드를 준비하세요.</p>
            ) : (
                <p>{gameStatus}</p>
            )}
        </div>
    );
};

export default GamePlay;
