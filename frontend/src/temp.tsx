const handleLeaveRoom = () => {
    if (roomId) {
        // 서버로 leaveRoom 이벤트 전송
        socket.emit("leaveRoom", { room: roomId });

        // 로비나 메인 화면으로 이동
        navigate("/"); // 원하는 경로로 설정
    }
};

return (
    <div className="game-play">
        <div className="outer-container">
            <header>
                <img src={logo} alt="로고" className="logo" />
                <h2 className="subtitle">AI로 말해요</h2>
                <h6>방 ID: {roomId}</h6>
                <button onClick={handleLeaveRoom} className="leave-room-button">
                    방 나가기
                </button>
            </header>
            <main className="main-container">
                {/* 나머지 게임 플레이 UI */}
            </main>
        </div>
    </div>
);