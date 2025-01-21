import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

const Game = () => {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [category, setCategory] = useState("");
  const [currentHost, setCurrentHost] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 방 참가 성공
    socket.on("roomJoined", ({ roomId }) => {
      console.log(`방 참가 성공: ${roomId}`);
      setRoomId(roomId);
    });

    // 참여자 목록 업데이트
    socket.on("getParticipants", ({ participants }) => {
      setParticipants(participants);
    });

    // 호스트 정보 업데이트
    socket.on("getHost", ({ host }) => {
      setCurrentHost(host);
      setIsHost(host === nickname);
    });

    // 채팅 메시지 수신
    socket.on("chatMessage", ({ nickname, message }) => {
      setMessages((prevMessages) => [...prevMessages, { nickname, message }]);
    });

    // 게임 시작
    socket.on("gameStarted", ({ category }) => {
      setCategory(category);
    });

    // 게임 종료
    socket.on("gameEnded", ({ message }) => {
      alert(message);
      setCategory("");
    });

    return () => {
      socket.disconnect();
    };
  }, [nickname]);

  const handleJoinRoom = () => {
    if (!nickname || !roomId) {
      alert("닉네임과 방 ID를 입력하세요!");
      return;
    }
    socket.emit("joinRoom", { room: roomId, nickname });
  };

  const handleStartGame = () => {
    if (!category) {
      alert("카테고리를 선택하세요!");
      return;
    }
    socket.emit("startGame", { room: roomId, category });
  };

  const handleSendMessage = () => {
    if (!inputMessage) return;
    socket.emit("chatMessage", { room: roomId, message: inputMessage });
    setInputMessage("");
  };

  const handleEndGame = () => {
    socket.emit("endGame", { room: roomId });
  };

  return (
    <div>
      <h1>게임 방</h1>

      <div>
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="text"
          placeholder="방 ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>방 참가</button>
      </div>

      {roomId && (
        <div>
          <h2>방 ID: {roomId}</h2>
          <h3>참여자 목록:</h3>
          <ul>
            {participants.map((participant) => (
              <li key={participant}>{participant}</li>
            ))}
          </ul>
          <h3>현재 호스트: {currentHost}</h3>

          {isHost && (
            <div>
              <h3>카테고리 선택:</h3>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">-- 카테고리 선택 --</option>
                <option value="영화">영화</option>
                <option value="음악">음악</option>
                <option value="스포츠">스포츠</option>
              </select>
              <button onClick={handleStartGame}>게임 시작</button>
            </div>
          )}

          <div>
            <h3>채팅</h3>
            <div>
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.nickname}:</strong> {msg.message}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지 입력"
            />
            <button onClick={handleSendMessage}>전송</button>
          </div>

          {isHost && <button onClick={handleEndGame}>게임 종료</button>}
        </div>
      )}
    </div>
  );
};

export default Game;
