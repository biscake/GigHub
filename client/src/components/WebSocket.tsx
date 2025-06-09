import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const WebSocketComponent = () => {
  const { accessToken, user } = useAuth();
  const [to, setTo] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const socket = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    socket.current = new WebSocket(`ws://localhost:3000/ws?token=${accessToken}`);

    socket.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
    };

    return () => {
      socket.current?.close();
    };
  }, [accessToken])

  const handleSubmit = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log('sending..');
      socket.current.send(JSON.stringify({
        type: 'Chat',
        to,
        ciphertext: message
      }))
    }
  }

  return (
    <div>
      socket test {user?.username}
      <input value={to} type='number' onChange={e => setTo(parseInt(e.target.value))} placeholder='to' className="border"/>
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder='message' className="border"/>
      <button type="submit" onClick={handleSubmit} className="bg-black-300">submit</button>
    </div>
  )
}

export default WebSocketComponent;