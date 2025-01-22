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
    const [gameStatus, setGameStatus] = useState<string>(''); // 게임 상태 메시지
    const navigate = useNavigate();
    // const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>(''); // 닉네임 상태 추가
    const [category, setCategory] = useState<string | null>(null); // 카테고리 상태 추가
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]); // 채팅 메시지 목록
    const [newMessage, setNewMessage] = useState<string>(''); // 입력 중인 메시지
    const isDevMode = false; // true로 설정하면 실제 API 호출을 막음
    const { script } = location.state || {}; // 초기 상태에서 category와 script 받기
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [timer, setTimer] = useState<number>(30); // 타이머 상태 추가
    const [participants, setParticipants] = useState<
            { nickname: string; totalScore: number }[]
        >([]);
        const [host, setHost] = useState<string>("");
    const [isGameEnded, setIsGameEnded] = useState<boolean>(false); // 게임 종료 여부
    const [hasStartedGame, setHasStartedGame] = useState<boolean>(false); // 게임 시작 버튼이 처음에만 뜨게 하기 위한 상태
    const [isHostNotified, setIsHostNotified] = useState(false);


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
            console.log(isHost);
            // 서버에서 방 참가 성공 시 처리
            socket.emit("getRoomState");
            socket.on('roomJoined', ({ roomId, isHost }) => {
                // if (isHost) {
                //     // 호스트일 경우 Game 페이지로 이동
                //     navigate(`/game/${roomId}`, { state: { nickname, roomId } });
                // } else {
                //     // 비호스트일 경우 GamePlay 페이지로 바로 이동
                //     navigate(`/game/${roomId}/gameplay`, { state: { nickname, roomId } });
                // }
                
                console.log(isHost);
                setIsHost(isHost);
            });

            socket.on('gameStarted', ({ imageUrl, category }) => {
                setImageUrl(imageUrl|| placeholderImage); // 이미지 URL 상태 업데이트
                setCategory(category|| '??'); // 카테고리 상태 업데이트
                setTimer(30); // 수정1
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

    //게임종료
    useEffect(() => {

        // 방 참가 시 서버에서 닉네임 수신
            // socket.on('roomJoined', ({ nickname, isHost }) => {
            //     setNickname(nickname);
            //     setIsHost(isHost);
            //     console.log(`닉네임: ${nickname}, 호스트 여부: ${isHost}`);
            // });
            // 게임 종료 이벤트 처리
            socket.on('gameEnded', ({ message, scores, nextHost }) => {
                console.log('게임 종료 이벤트 수신:');
                console.log('메시지:', message);
                console.log('점수:', scores);
                console.log('다음 호스트 ID:', nextHost);
        
                setMessages((prev) => [...prev, `[알림]: 게임이 종료되었습니다`]); // 시스템 메시지 추가
                setScores(scores); // 점수 업데이트
                setIsGameEnded(true); // 게임 종료 상태 설정
                
        
                // 현재 사용자가 다음 호스트인지 판단
                // if (nickname === nextHost) {
                //     console.log('호스트 ID:', nickname);
                //     console.log('현재 사용자가 다음 호스트입니다.');
                //     setIsHost(true); // 호스트 상태 업데이트
                //     navigate(`/game/${roomId}`); // 호스트는 Game 화면으로 이동
                // } else {
                //     console.log('게스트 ID:', nickname);
                //     console.log('현재 사용자는 호스트가 아닙니다.');
                //     setIsHost(false); // 비호스트 상태 유지
                //     setGameStatus('게임이 종료되었습니다. 호스트가 새로운 라운드를 준비 중입니다.');
                // }
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

    // 타이머 업데이트 이벤트 리스너
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

    // 타이머 종료 핸들러
    // const handleTimerEnd = () => {
    //     console.log('타이머가 종료되었습니다.');
    //     setIsGameRunning(false);
    //     setTimer(0);
    // };

    //호스트 채팅 제한
    useEffect(() => {
        socket.on("chatError", (data) => {
            alert(data.message); // 알림 표시
        });
    
        return () => {
            socket.off("chatError");
        };
    }, []);

    // 참가자 목록 및 점수 업데이트 이벤트
    useEffect(() => {

        // 참가자 목록 요청
        socket.emit("getParticipants", roomId);

        socket.on("participantsUpdated", ({ participants, host }) => {
            setParticipants(participants); // 참가자와 점수 상태 업데이트
            setHost(host); // 호스트 정보 업데이트
        });

        return () => {
            socket.off("participantsUpdated");
        };
    }, []);

    // 호스트 확인
    useEffect(() => {
        socket.on("hostInitialized", ({ message }) => {
            setIsHostNotified(true); // 호스트 상태 업데이트
        });
        console.log(isHostNotified);
    
        return () => {
            socket.off("hostInitialized");
        };
    }, []);

    

    //방 나가기
    const handleLeaveRoom = () => {
        if (roomId) {
            // 서버로 leaveRoom 이벤트 전송
            socket.emit("leaveRoom", { room: roomId });
    
            // 로비나 메인 화면으로 이동
            navigate("/"); // 원하는 경로로 설정
        }
    };

    //게임 처음 시작 버튼
    const handleStartGame = () => {
            socket.emit("startGame", { room: roomId });
            setHasStartedGame(true); // 버튼을 숨기기 위해 설정
            navigate(`/game/${roomId}`); // Game 페이지로 이동
        };
    

    //게임 시작 & 재시작 버튼
    const handleRestartGame = () => {
        setIsGameEnded(false); // 게임 종료 상태 초기화
        navigate(`/game/${roomId}`); // Game 페이지로 이동
    };
    

    
    //채팅 입력
    const sendMessage = () => {
        if (newMessage.trim() !== '' && roomId) {
            // 서버로 메시지 전송
            socket.emit('chatMessage', { room: roomId, message: newMessage });
            console.log(`채팅 입력 성공: ${roomId}`);
            setTimer(0); // 타이머를 0으로 설정
            setNewMessage(''); // 입력창 초기화
        }
    };

    return (
        <div className="game-play">
            <div className="outer-container">
                <header>
                    <img src={logo||placeholderImage} alt="로고" className="logo" />
                    <h2 className="subtitle">AI로 말해요</h2>
                    <h6>방 ID: {roomId}</h6> {/* 방 ID 표시 */}
                    <Timer initialTime={timer} isRunning={isGameRunning} />
                    <button onClick={handleLeaveRoom} className="leave-room-button">
                    방 나가기
                    </button>
                    {isHostNotified && (
                        <div className="game-restart">
                            <button onClick={handleStartGame} className="restart-button">
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
            {/* <h1>게임 플레이</h1> */}
            {isHost ? (
                <p>새로운 라운드를 준비하세요.</p>
            ) : (
                <p>{gameStatus}</p>
            )}

            {/* <h3>점수</h3>
            {scores.map((score, index) => (
                <p key={index}>
                    {score.nickname}: 이번 라운드 {score.earnedScore}점, 총점 {score.totalScore}점
                </p>
            ))} */}
        </div>
    );
};

export default GamePlay;