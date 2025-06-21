import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useMessageCache } from "../hooks/useMessageCache";
import type { CachedDecryptedMessage } from "../types/chat";

const WebSocketComponent = () => {
  const { user } = useAuth();
  const [to, setTo] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const { sendMessageToUser, sendRead } = useChat();
  const [toDisplay, setToDisplay] = useState<number | null>(null);
  const { getMessagesByUser, loadMessageFromDBByUser, cache } = useMessageCache();
  const [toLoad, setToLoad] = useState<number>(0);

  const [messages, setMessages] = useState<CachedDecryptedMessage[]>([]);

  useEffect(() => {
    if (!toDisplay) return;
  
    async function fetchMessages() {
      const messages = getMessagesByUser(toDisplay!);
      setMessages(messages)
    }
  
    console.log("fetching...");
    fetchMessages();
  }, [cache, toDisplay, getMessagesByUser]);

  return (
    <>
      <div>
        socket test {user?.username}
        <input value={to} type='number' onChange={e => setTo(parseInt(e.target.value))} placeholder='to' className="border"/>
        <input value={message} onChange={e => setMessage(e.target.value)} placeholder='message' className="border"/>
        <button type="submit" onClick={() => sendMessageToUser(message, to)} className="bg-black-300">submit</button>
      </div>

      <div>
        load
        <input value={toLoad} type='number' onChange={e => setToLoad(parseInt(e.target.value))} placeholder='to load' className="border"/>
        <button type="submit" onClick={async () => await loadMessageFromDBByUser(toLoad)} className="bg-black-300">load</button>
      </div>

      <div>
        <input value={toDisplay ?? 0} type='number' onChange={e => setToDisplay(parseInt(e.target.value))} placeholder='display' className="border"/>
        {messages && messages.map((msg, i) => {
          return (
            <>
              <div key={i}>
                <span>{msg.direction}:&nbsp;</span>
                {msg.text}
                <span className={msg.readAt ? "text-green-600" : "text-red-600"}>&nbsp;{msg.readAt ? "read" : "unread"}</span>
                {msg.direction === "incoming" && <button onClick={() => sendRead([msg.id])}>read</button>}
              </div>
            </>
          )
        })}
      </div>
    </>
  )
}

export default WebSocketComponent;