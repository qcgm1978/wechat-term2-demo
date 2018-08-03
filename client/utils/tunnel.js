export default (tunnel) => {

  // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
  tunnel.on('connect', () => console.log('WebSocket 信道已连接'));
  tunnel.on('close', () => console.log('WebSocket 信道已断开'));
  tunnel.on('reconnecting', () => console.log('WebSocket 信道正在重连...'));
  tunnel.on('reconnect', () => console.log('WebSocket 信道重连成功'));
  tunnel.on('error', error => console.error('信道发生错误：', error));

  // 监听自定义消息（服务器进行推送）
  tunnel.on('speak', speak => console.log('收到 speak 消息：', speak));

  // 打开信道
  tunnel.open();
  // 发送消息
  tunnel.emit('speak', {
    word: "hello",
    who: {
      nickName: "techird"
    }
  });
  // 关闭信道
  // tunnel.close();
}