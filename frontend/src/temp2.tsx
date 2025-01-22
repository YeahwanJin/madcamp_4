useEffect(() => {
    socket.on("gameStartReady", ({ message }) => {
        alert(message); // 시간 초과 메시지 표시
        navigate("/gameplay", { state: { roomId, keyword: "기본 키워드" } }); // 화면 전환
    });

    return () => {
        socket.off("gameStartReady");
    };
}, []);