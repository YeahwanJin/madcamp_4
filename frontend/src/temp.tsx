useEffect(() => {
    socket.on("hostTransition", ({ roomId, message }) => {
        alert(message);
        navigate(`/game/${roomId}`); // Game 화면으로 이동
    });

    return () => {
        socket.off("hostTransition");
    };
}, []);