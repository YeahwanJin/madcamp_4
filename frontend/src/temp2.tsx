.right-box {
    position: absolute; /* 모니터 배경 안에 위치시키기 위해 절대 위치 설정 */
    top: 45%; /* 모니터 화면의 중앙으로 이동 */
    left: 50%; /* 가로 중앙 정렬 */
    transform: translate(-50%, -50%); /* 정중앙으로 조정 */
    width: 80%; /* 모니터 화면 비율에 맞게 너비 설정 */
    height: 60%; /* 모니터 화면 비율에 맞게 높이 설정 */
    background-color: rgba(255, 255, 255, 0.9); /* 투명 흰색 배경 */
    border-radius: 10px; /* 모서리를 둥글게 */
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* 부드러운 그림자 */
    overflow: auto; /* 내용이 넘칠 경우 스크롤 활성화 */
}