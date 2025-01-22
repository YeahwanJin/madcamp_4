const { Server } = require("socket.io");
const fetch = require("node-fetch"); // 정답 단어 API 호출을 위해 fetch 사용

const roomStates = {}; // 방 상태 저장



function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("클라이언트 연결됨");

        // 방 입장 이벤트
        socket.on("joinRoom", ({ room, nickname }) => {
            socket.join(room);
            socket.nickname = nickname;

            if (!roomStates[room]) {
                roomStates[room] = {
                    currentKeyword: null, // 정답 단어
                    currentCategory: null, // 선택된 카테고리
                    host: nickname, // 첫 번째 참가자를 호스트로 설정
                    round: 1, // 첫 라운드 설정
                    participants: [],
                };
            }

            roomStates[room].participants.push(nickname);
            const isHost = roomStates[room].host === nickname; // 호스트 여부 판단

            socket.emit('roomJoined', { roomId: room, isHost });

            // 참가자 목록 업데이트 및 방 입장 메시지
            io.to(room).emit("participantsUpdated", {
                participants: roomStates[room].participants,
                host: roomStates[room].host,
            });

            io.to(room).emit("roomMessage", {
                message: `${nickname} 님이 ${room} 방에 입장하였습니다.`,
            });
        });

        // 방 나가기 이벤트
        socket.on("leaveRoom", ({ room }) => {
            const state = roomStates[room];
            if (!state) return;

            const index = state.participants.indexOf(socket.nickname);
            if (index !== -1) {
                state.participants.splice(index, 1);

                // 호스트가 나가면 다음 참가자로 호스트 변경
                if (state.host === socket.nickname) {
                    if (state.participants.length > 0) {
                        state.host = state.participants[0];
                    } else {
                        delete roomStates[room]; // 참가자가 없으면 방 삭제
                        return;
                    }
                }

                // 참가자 목록 업데이트 및 방 나가기 메시지
                io.to(room).emit("participantsUpdated", {
                    participants: state.participants,
                    host: state.host,
                });

                io.to(room).emit("roomMessage", {
                    message: `${socket.nickname} 님이 방에서 퇴장하였습니다.`,
                });

                socket.leave(room);
                console.log(`[${room}] ${socket.nickname} 방 나감`);
            }
        });

        // 게임 시작 이벤트
        socket.on("startGame", async ({ room, category }) => {
            const roomState = roomStates[room];

            if (!roomState) {
                return socket.emit("error", { message: "방이 존재하지 않습니다." });
            }

            try {
                // 정답 단어 API 호출
                const response = await fetch("http://localhost:3000/keyword", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ category }),
                });

                const data = await response.json();
                const randomKeyword = data.keyword; // 정답 단어

                // 방 상태 업데이트
                roomState.currentKeyword = randomKeyword;
                roomState.currentCategory = category;

                // 호스트에게 설명 입력 요청
                io.to(socket.id).emit("hostPrepare", {
                    message: "설명을 작성하세요!",
                    keyword: randomKeyword,
                });

                // 나머지 클라이언트에게 대기 메시지 전송
                socket.to(room).emit("waitingForHost", {
                    message: "호스트가 준비 중입니다...",
                });

                console.log(`[${room}] 게임 준비 중 - 카테고리: ${category}, 정답: ${randomKeyword}`);
            } catch (error) {
                console.error("게임 준비 중 오류:", error);
                socket.emit("error", { message: "게임 준비에 실패했습니다." });
            }
        });

        // 호스트가 설명 제출
        socket.on("submitScript", async ({ room, script }) => {
            const roomState = roomStates[room];
        
            if (!roomState || roomState.host !== socket.nickname) {
                return socket.emit("error", { message: "호스트만 설명을 제출할 수 있습니다." });
            }
        
            try {
                // 그림 생성 API 호출
                const response = await fetch("http://localhost:3000/generate-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: script, // script를 prompt로 매핑
                        n: 1, // 기본값 설정
                        size: "1024x1024" // 기본값 설정
                    }),
                });
        
                const data = await response.json();
        
                // API 응답 구조가 맞는지 확인
                const imageUrl = data.imageUrls?.[0]; // 첫 번째 이미지 URL 가져오기
                if (!imageUrl) {
                    throw new Error("이미지 URL을 가져오지 못했습니다.");
                }
        
                // 방의 모든 클라이언트에게 게임 시작 알림 및 그림 전송
                io.to(room).emit("gameStarted", {
                    imageUrl, // 생성된 그림 URL
                    category: roomState.currentCategory,
                });
        
                console.log(`[${room}] 게임 시작 - 정답: ${roomState.currentKeyword}, 그림 URL: ${imageUrl}`);

                setTimeout(() => {
                    endGame(room);
                }, 30000); // 30초

            } catch (error) {
                console.error("그림 생성 중 오류:", error);
                socket.emit("error", { message: "그림 생성에 실패했습니다." });
            }
        });

        // 채팅 메시지 이벤트
        socket.on("chatMessage", ({ room, message }) => {
            const roomState = roomStates[room];
            console.log(`수신된 메시지 - 방: ${room}, 사용자: ${socket.nickname}, 메시지: ${message}`);

            if (roomState && message === roomState.currentKeyword) {
                console.log(`[${room}] ${socket.nickname}: ${message}`);

                // 정답 맞힌 사람 추가
                if (!roomState.correctUsers) {
                    roomState.correctUsers = [];
                }

                if (!roomState.correctUsers.includes(socket.nickname)) {
                    roomState.correctUsers.push(socket.nickname);
                }

                io.to(room).emit("chatMessage", {
                    nickname: socket.nickname,
                    message: "정답!",
                });

                if (roomState.correctUsers.length === roomState.participants.length) {
                    clearTimeout(roomState.gameTimer);
                    endGame(room);
                }

                
            } else {
                console.log(`[${room}] ${socket.nickname}: ${message}`);
                io.to(room).emit("chatMessage", {
                    nickname: socket.nickname,
                    message,
                });
            }
        });

        // 연결 해제 이벤트
        socket.on("disconnect", () => {
            console.log(`${socket.nickname || "사용자"} 연결 해제`);
        });
        
        function endGame(room) {
            const roomState = roomStates[room];
        
            if (!roomState) return;
        
            // 총점 상태 초기화
            if (!roomState.totalScores) {
                roomState.totalScores = {}; // { nickname: totalScore }
            }
        
            // 라운드 점수 계산
            const scores = roomState.participants.map((participant) => {
                const earnedScore = roomState.correctUsers?.includes(participant) ? 200 : 0;
                roomState.totalScores[participant] = (roomState.totalScores[participant] || 0) + earnedScore;
        
                return {
                    nickname: participant,
                    earnedScore,
                    totalScore: roomState.totalScores[participant],
                };
            });
        
            // 다음 호스트 설정
            const currentHostIndex = roomState.participants.indexOf(roomState.host);
            const nextHostIndex = (currentHostIndex + 1) % roomState.participants.length; // 순환
            const nextHost = roomState.participants[nextHostIndex];
            roomState.host = nextHost;
        
            // 다음 호스트의 소켓을 찾아 이벤트 전송
            const nextHostSocket = Array.from(io.sockets.sockets.values()).find(
                (socket) => socket.nickname === nextHost
            );
        
            if (nextHostSocket) {
                nextHostSocket.emit("hostTransition", {
                    roomId: room,
                    message: "당신이 새로운 호스트입니다. 게임을 시작하세요.",
                });
            } else {
                console.warn(`[${room}] 다음 호스트(${nextHost})를 찾을 수 없습니다.`);
                // 추가적으로 호스트가 없을 때 다른 처리를 여기에 작성할 수 있음
            }
        
            // 모든 클라이언트에게 게임 종료 알림
            io.to(room).emit("gameEnded", {
                message: "게임이 종료되었습니다!",
                scores,
                nextHost,
            });
        
            console.log(`[${room}] 게임 종료 - 새로운 호스트: ${roomState.host}`);
        
            // 게임 상태 초기화
            roomState.currentKeyword = null; // 정답 초기화
            roomState.currentCategory = null;
            roomState.correctUsers = [];
            clearTimeout(roomState.gameTimer);
        }
    });
}

module.exports = initializeSocket;
