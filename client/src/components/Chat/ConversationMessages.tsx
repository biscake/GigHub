import { useEffect, useMemo, useState } from "react";
import { useChat } from "../../hooks/useChat";
import type { ConversationMessageContainerProps, MessageInputProps, MessageProps, MessagesContainerProps } from "../../types/chatUI";
import { useMessageCache } from "../../hooks/useMessageCache";
import { useAuth } from "../../hooks/useAuth";

const ConversationMessage = ({ conversationKey }: ConversationMessageContainerProps) => {
  const { getConversationMetaByKey } = useMessageCache();
  const [title, setTitle] = useState("");
  const [otherUsername, setOtherUsername] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationKey) return;
    const meta = getConversationMetaByKey(conversationKey);
    setTitle(meta?.title ?? "");
    setOtherUsername(meta?.participants?.filter(p => p !== user!.username).join("") ?? "")
  }, [conversationKey, getConversationMetaByKey, user])

  return (
    <div className="w-full h-full flex flex-col">
      {conversationKey && 
        <>
          <div className="bg-main p-4 text-2xl">{title}</div>
        <MessagesContainer conversationKey={conversationKey} otherUsername={otherUsername} />
          <MessageInput conversationKey={conversationKey} />
        </>
      }
    </div>
  )
}

const MessageInput = ({ conversationKey }: MessageInputProps) => {
  const { sendMessageToConversation } = useChat();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    const toSend = message.trim();
    if (!toSend) return;

    sendMessageToConversation(toSend, conversationKey);
    setMessage("");
  }

  return (
    <div className="flex w-full mt-auto p-5 gap-3 bg-main border-main border-t-2">
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="bg-white rounded-xl border-black flex-1 h-12 px-2 py-1"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  )
}

const MessagesContainer = ({ conversationKey, otherUsername }: MessagesContainerProps) => {
  const { getMessagesByKey, loadMessageFromDBByKey } = useMessageCache();
  const { fetchMessagesBefore } = useChat();
  const messages = useMemo(() => getMessagesByKey(conversationKey), [conversationKey, getMessagesByKey]);

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;

    const isTop = element.scrollTop <= element.clientHeight - element.scrollHeight;

    if (isTop) {
      const oldest = messages[messages.length - 1].sentAt;
      await fetchMessagesBefore(conversationKey, oldest);
      await loadMessageFromDBByKey(conversationKey);
    }
  }

  return (
    <div
      className="flex flex-col-reverse overflow-y-auto scrollbar-minimal gap-2 p-4"
      onScroll={handleScroll}
    >
      {
        messages
          ? messages.map((msg, i) => <Message key={i} message={msg} otherUsername={otherUsername} />)
          : "No messages"
      }
    </div>
  )
}

const Message = ({ message, otherUsername }: MessageProps) => {
  return (
    <div
      data-id={message.id}
      className={`${message.direction === "incoming" ? "self-start bg-[#b58880]" : "self-end bg-[#d5aea6]"} flex flex-col px-3 py-1 rounded-xl max-w-[30vw]`}>
      {message.direction === "incoming" &&
        <div className="font-bold">
          {otherUsername}
        </div>
      }
      <div className="flex gap-4">
        <div className={`${!message.text ? "italic" : "font-semibold"}`}>{message.text ?? "Failed to get message"}</div>
        <div className="font-medium text-xs self-end">
          {new Date(message.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      </div>
    </div>
  )
}


export default ConversationMessage;