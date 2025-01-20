import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // 로고 추가
import axios from 'axios';
import placeholderImage from '../assets/placeholder.png'; // 임의의 이미지 추가
import '../styles/GamePlay.css';

const GamePlay: React.FC = () => {
    const location = useLocation();
    const state = location.state as { description: string; keyword: string };
    const { description, keyword } = state || {};

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isDevMode = true; // true로 설정하면 실제 API 호출을 막음

    useEffect(() => {
        if (description) {
            if (isDevMode) {
                // 개발 모드에서는 임의의 이미지 URL 사용
                console.log('개발 모드: 실제 API 호출을 생략합니다.');
                setTimeout(() => {
                    setImageUrl(placeholderImage); // 로컬 이미지 경로 설정
                }, 1000); // API 응답 시뮬레이션 (1초 지연)
            } else {
                // 실제 API 호출
                const requestBody = {
                    prompt: description, // 설명만 전송
                    n: 1, // 이미지 1개 생성 요청
                    size: "1024x1024" // 이미지 크기 지정
                };

                axios
                    .post('http://192.249.29.181:3000/generate-image', requestBody)
                    .then(response => {
                        const { imageUrls } = response.data;
                        if (imageUrls && imageUrls.length > 0) {
                            setImageUrl(imageUrls[0]); // 생성된 이미지 URL 설정
                        } else {
                            setError('이미지를 가져오는 데 실패했습니다.');
                        }
                    })
                    .catch((err) => {
                        if (err.response && err.response.data && err.response.data.error) {
                            setError(err.response.data.error); // 서버로부터 받은 에러 메시지
                        } else {
                            setError('이미지 생성에 실패했습니다. 다시 시도해주세요.');
                        }
                    });
            }
        }
    }, [description, keyword, isDevMode]);

    return (
        <div className="game-play">
            <div className="outer-container">
            <header>
                <img src={logo} alt="로고" className="logo" />
                <h2 className="subtitle">AI로 말해요</h2>
            </header>
            <main>
                <h1>게임 플레이</h1>
                <p>제시어: {keyword}</p>
                <p>설명: {description}</p>
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
            </main>
        </div>
        </div>
    );
};

export default GamePlay;
