import React, { useEffect, useState } from "react";
import socket from "../socket"; // 소켓 연결

const GameList: React.FC = () => {
    const [rooms, setRooms] = useState<{ roomName: string; participantCount: number }[]>([]);

    useEffect(() => {
        // 서버에 방 목록 요청
        socket.emit("getRoomList");

        // 방 목록 업데이트 수신
        socket.on("roomListUpdated", ({ rooms }) => {
            setRooms(rooms); // 방 목록 상태 업데이트
            console.log("받은 방 목록:", rooms);
        });

        // 이벤트 리스너 정리
        return () => {
            socket.off("roomListUpdated");
        };
    }, []);

    return (
        <div className="game-list">
            {rooms.length > 0 ? (
                <ul>
                    {rooms.map((room, index) => (
                        <li key={index}>
                            <p>방 이름: {room.roomName}</p>
                            <p>참가자 수: {room.participantCount}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>현재 생성된 방이 없습니다.</p>
            )}
        </div>
    );
};

export default GameList;
