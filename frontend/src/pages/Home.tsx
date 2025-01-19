import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import logo from '../assets/logo.png';
import defaultPhoto1 from '../assets/defaultPhoto1.jpg'; // 미리 준비된 아이콘 경로
import defaultPhoto2 from '../assets/defaultPhoto2.jpg';
import defaultPhoto3 from '../assets/defaultPhoto3.jpg';
import wrenchIcon from '../assets/wrench.png'; // 몽키스패너 아이콘
import playIcon from '../assets/play-icon.webp'; // 플레이 아이콘 추가

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isPickerOpen, setPickerOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timerProgress, setTimerProgress] = useState(0);

    const photos = [defaultPhoto1, defaultPhoto2, defaultPhoto3];
    const texts = [
        "1. 제시어를 보고 설명을 입력한다.",
        "2. AI가 설명을 토대로 만든 그림을 보고 제시어를 맞춘다.",
        "3. 점수: 1등 500p, 2등 300p, 나머지 맞춘 인원 200p",
        "4. 재미있는 게임 규칙을 읽어보세요!",
        "5. 더 많은 친구를 초대해 즐겨보세요!",
        "6. 지금 바로 시작하세요!",
    ];

    const togglePicker = () => {
        setPickerOpen(!isPickerOpen);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length); // 다음 텍스트로 이동
            setTimerProgress(0); // 타이머 초기화
        }, 3000); // 3초마다 변경

        const timer = setInterval(() => {
            setTimerProgress((prev) => (prev + 10) % 100); // 타이머 진행
        }, 300); // 300ms마다 진행

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [texts.length]);



    return (
        <div className="home">
            <div className="outer-container">
            <header className="header">
                <img src={logo} alt="1박 2일 로고" className="logo" />
                <h2 className="sub-title">AI로 말해요</h2>
            </header>
            <></>
            <div className="content">
                {/* 왼쪽 박스 */}
                <div className="left-box">
                    <h3>캐릭터와 닉네임 선택</h3>
                    <div className="photo-preview-container">
                        <div className="photo-preview">
                            {selectedPhoto ? (
                                <img src={selectedPhoto} alt="Selected Character" className="selected-photo" />
                            ) : (
                                <div className="placeholder-circle"></div>
                            )}
                        </div>
                        <button className="wrench-button" onClick={togglePicker}>
                            <img src={wrenchIcon} alt="설정 아이콘" className="wrench-icon" />
                        </button>
                    </div>
                    {isPickerOpen && (
                        <div className="photo-picker">
                            {photos.map((photo, index) => (
                                <button
                                    key={index}
                                    className="photo-button"
                                    onClick={() => {
                                        setSelectedPhoto(photo);
                                        setPickerOpen(false); // 선택 후 선택창 닫기
                                    }}
                                >
                                    <img src={photo} alt={`Character ${index + 1}`} className="photo-thumbnail" />
                                </button>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        className="nickname-input"
                    />
                    <div className="button-container">
                        <button className="button" onClick={() => navigate('/game')}>
                        <img src={playIcon} alt="Play Icon" className="button-icon" />
                            게임 추가
                        </button>
                        <button className="button">방 참가</button>
                    </div>
                </div>
                {/* 오른쪽 박스 */}
                <div className="right-box">
                        <h3>플레이 방법</h3>
                        <div className="text-box">
                            <p>{texts[currentIndex]}</p>
                        </div>
                        <div className="dots">
                            {texts.map((_, index) => (
                                <div
                                    key={index}
                                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                                    style={{
                                        background: index === currentIndex
                                            ? `conic-gradient(#a7a6a6 ${timerProgress}%, #e0e0e0 ${timerProgress}%)`
                                            : '#e0e0e0',
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
            </div>
        </div>
        </div>
    );
};

export default Home;
