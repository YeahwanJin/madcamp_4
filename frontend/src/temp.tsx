const [isHostNotified, setIsHostNotified] = useState(false);

useEffect(() => {
    socket.on("hostNotification", ({ message }) => {
        alert(message); // 호스트에게 알림 표시
        setIsHostNotified(true); // 버튼 표시 상태 활성화
    });

    return () => {
        socket.off("hostNotification");
    };
}, []);

const handleStartGame = () => {
    // 게임 시작 로직
    console.log("게임 시작");
    socket.emit("startGame", { room: roomId });
};

return (
    <div>
        {/* 버튼은 알림을 받은 경우에만 렌더링 */}
        {isHostNotified && (
            <button onClick={handleStartGame} className="start-button">
                게임 시작
            </button>
        )}
    </div>
);