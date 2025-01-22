const GamePlay: React.FC = () => {
    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const location = useLocation();
    const state = location.state as { description: string; keyword: string };
    const [scores, setScores] = useState<
        { nickname: string; earnedScore: number; totalScore: number }[]
    >([]);
    const [isHost, setIsHost] = useState(false);
    const [gameStatus, setGameStatus] = useState('');
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [category, setCategory] = useState<string>('??'); // 기본값 '??'
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const isDevMode = false;
    const [imageUrl, setImageUrl] = useState<string>(placeholderImage); // 기본 이미지 설정
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [timer, setTimer] = useState<number>(30);
    const [participants, setParticipants] = useState<
        { nickname: string; totalScore: number }[]
    >([]);
    const [host, setHost] = useState<string>('');

    // 게임 시작 이벤트 핸들러
    useEffect(() => {
        if (roomId) {
            console.log(`방 ${roomId}에 입장한 상태입니다.`);

            socket.on('gameStarted', ({ imageUrl, category }) => {
                setImageUrl(imageUrl || placeholderImage); // 이미지가 없으면 기본 이미지 사용
                setCategory(category || '??'); // 카테고리가 없으면 '??'로 표시
                setTimer(30);
                console.log(`게임 시작: 그림 URL(${imageUrl}), 카테고리(${category}) 수신`);
            });

            return () => {
                socket.off('gameStarted');
            };
        }
    }, [roomId]);

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

    // 참가자 목록 및 점수 업데이트 이벤트
    useEffect(() => {
        socket.on('participantsUpdated', ({ participants, host }) => {
            setParticipants(participants);
            setHost(host);
        });

        return () => {
            socket.off('participantsUpdated');
        };
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() !== '' && roomId) {
            socket.emit('chatMessage', { room: roomId, message: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="game-play">
            <div className="outer-container">
                <header>
                    <img src={logo} alt="로고" className="logo" />
                    <h2 className="subtitle">AI로 말해요</h2>
                    <h6>방 ID: {roomId}</h6>
                    <Timer initialTime={timer} isRunning={isGameRunning} />
                </header>
                <main className="main-container">
                    <div className="participants-list">
                        <h3>참가자 목록</h3>
                        {participants
                            .sort((a, b) => b.totalScore - a.totalScore)
                            .map((participant, index) => (
                                <div key={index} className="participant-item">
                                    <p>
                                        {index + 1}. {participant.nickname}{' '}
                                        {participant.nickname === host && '(호스트)'}
                                    </p>
                                    <p>점수: {participant.totalScore}점</p>
                                </div>
                            ))}
                    </div>

                    <div className="image-container">
                        <h1>게임 플레이</h1>
                        <p>카테고리: {category}</p> {/* 기본값으로 '??' 표시 */}
                        <p>{script || '설명이 없습니다.'}</p>
                        {error ? (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <div className="image-display">
                                <img src={imageUrl} alt="생성된 이미지" />
                            </div>
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
        </div>
    );
};

export default GamePlay;
