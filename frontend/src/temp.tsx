.participants-list {
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
}

.participants-list li {
    padding: 10px;
    background-color: #ffffff;
}

.participants-list li:nth-child(odd) {
    background-color: #f9f9f9;
}
컨테이너 및 레이아웃 조정
헤더와 다른 컨테이너들이 빈틈없이 붙게끔 조정하고, 채팅 및 이미지 컨테이너의 스타일을 수정합니다:

css
복사
.header {
    margin-bottom: 0; /* 헤더와 메인 컨테이너 사이의 간격 제거 */
    width: 100%; /* 헤더의 너비를 최대로 조정 */
}

.main-container {
    width: 100%; /* 메인 컨테이너 너비 최대로 조정 */
    display: flex;
    justify-content: space-between;
    margin-top: 0; /* 상단 여백 제거 */
}

.image-container {
    flex: 3;
    margin-right: 20px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-container {
    flex: 1;
    margin-left: 20px; /* 이미지 컨테이너와의 간격 조정 */
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 8px;
}