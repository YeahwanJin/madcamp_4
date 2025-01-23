
<input
    type="text"
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyPress={(e) => {
        if (e.key === 'Enter' && newMessage.trim() !== '') {
            sendMessage();
            e.preventDefault(); // 엔터 키 입력 시 기본 이벤트(폼 제출) 방지
        }
    }}
    placeholder="메시지를 입력하세요"
/>
<button onClick={sendMessage}>전송</button>
</div>
