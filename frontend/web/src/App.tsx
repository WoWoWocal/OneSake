import { useState, useEffect } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: string;
}

interface LogEvent {
  seq: number;
  timestamp: string;
  type: string;
  text: string;
}

function App() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [logEvents, setLogEvents] = useState<LogEvent[]>([]);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_BACKEND_URL + '/matchHub')
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  const joinRoom = async () => {
    if (connection && roomCode) {
      try {
        await connection.start();
        await connection.invoke('JoinRoom', roomCode);

        connection.on('ChatMessage', (message: ChatMessage) => {
          setChatMessages(prev => [...prev, message]);
        });

        connection.on('LogEvent', (event: LogEvent) => {
          setLogEvents(prev => [...prev, event]);
        });
      } catch (e) {
        console.log('Connection failed: ', e);
      }
    }
  };

  const sendChat = async () => {
    if (connection && chatInput) {
      await connection.invoke('SendChat', roomCode, chatInput);
      setChatInput('');
    }
  };

  return (
    <div>
      <h1>OneSake PvP</h1>
      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={joinRoom}>Join</button>

      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px', marginRight: '10px' }}>
          <h3>Chat</h3>
          <div style={{ height: '200px', overflowY: 'scroll' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.senderId}:</strong> {msg.text} ({new Date(msg.timestamp).toLocaleTimeString()})
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChat()}
          />
          <button onClick={sendChat}>Send</button>
        </div>

        <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
          <h3>Log</h3>
          <div style={{ height: '200px', overflowY: 'scroll' }}>
            {logEvents.map((evt, idx) => (
              <div key={idx}>
                [{evt.seq}] {evt.type}: {evt.text} ({new Date(evt.timestamp).toLocaleTimeString()})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;