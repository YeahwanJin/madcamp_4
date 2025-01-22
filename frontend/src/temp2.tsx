import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';

const GamePlay: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState<string>(''); // 닉네임 상태 추가
    const [isHost, setIsHost] = useState<boolean>(false);
    const [gameStatus, setGameStatus] = useState<string>('게임 진행 중입니다.');
    const [scores, setScores] = useState<{ nickname: string; earnedScore: number; totalScore: number }[]>([]);

    useEffect(() => {
        // 방 참가 시 서버에서 닉네임 수신
        socket.on('roomJoined', ({ nickname, isHost }) => {
            setNickname(nickname);
            setIsHost(isHost);
            console.log(`닉네임: ${nickname}, 호스트 여부: ${isHost}`);
        });

        // 게임 종료 이벤트 처리
        socket.on('gameEnded', ({ message, scores, nextHost }) => {
            alert(message);
            setScores(scores);

            // 현재 사용자가 호스트인지 확인
            if (nickname === nextHost) {
                setIsHost(true);
                navigate(`/game/${roomId}`);
            } else {
                setIsHost(false);
                setGameStatus('게임이 종료되었습니다. 호스트가 새로운 라운드를 준비 중입니다.');
            }
        });

        return () => {
            socket.off('roomJoined');
            socket.off('gameEnded');
        };
    }, [nickname, roomId, navigate]);

    return (
        <div>
            <h1>게임 플레이</h1>
            <h3>{gameStatus}</h3>
            {isHost && <p>새로운 라운드를 준비하세요!</p>}
            <h3>점수</h3>
            {scores.map((score, index) => (
                <p key={index}>
                    {score.nickname}: {score.earnedScore}점 (총 {score.totalScore}점)
                </p>
            ))}
        </div>
    );
};

export default GamePlay;