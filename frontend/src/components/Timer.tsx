import React, { useEffect, useState } from 'react';
import timer from '../assets/timerImage.png';
import '../styles/timer.css';

interface TimerProps {
    initialTime: number; // 타이머 초기 시간 (초 단위)
    isRunning: boolean; // 타이머가 실행 중인지 여부
}

const Timer: React.FC<TimerProps> = ({ initialTime, isRunning }) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isRunning && timeRemaining > 0) {
            // 타이머 실행
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
        };
    }, [isRunning, timeRemaining]);

    useEffect(() => {
        // 타이머 초기화 시 초기 시간을 설정
        setTimeRemaining(initialTime);
    }, [initialTime]);

    return (
        <div className="timer">
            <img src={timer} alt="timer" className="timer-icon" />
            <span className="timer-display">
                {Math.floor(timeRemaining / 60)
                    .toString()
                    .padStart(2, '0')}
                :
                {(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
        </div>
    );
};

export default Timer;
