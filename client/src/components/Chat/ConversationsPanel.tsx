import { useAuth } from "../../hooks/useAuth";
import { useMessageCache } from "../../hooks/useMessageCache";
import type { ConversationTabProps } from "../../types/chatUI";
import { Link } from "react-router-dom";

const ConversationsPanel = () => {
  const { latestConversationMessage, getConversationMetaByKey } = useMessageCache();

  return (
    <div className="flex flex-col-reverse justify-end w-[300px] bg-main p-2 relative border-main border-r-1 gap-2">
      {latestConversationMessage.length > 0
        ? <>
            {latestConversationMessage.map((conversation, i) => {
              const message = conversation.latestMessage;
              const meta = getConversationMetaByKey(conversation.conversationKey);
  
              return (
                <ConversationTab
                  key={i}
                  latestMessage={message?.text ?? ""}
                  conversationKey={conversation.conversationKey}
                  participants={meta?.participants}
                  title={meta?.title}
                />
              )
            })}
          </>
        : "No messages, click + to start a new conversation"
      }
      <div className="text-2xl font-bold">Conversations</div>
    </div>
  )
}

const ConversationTab = ({ latestMessage, conversationKey, participants, title }: ConversationTabProps) => {
  const { user } = useAuth();

  return (
    <Link
      to={`/chat?conversationKey=${conversationKey}`}
      className="flex flex-col w-full bg-white px-4 py-2 cursor-pointer rounded-xl border-main border-2"
    >
      <div className="truncate font-bold text-xl">{title}</div>
      <div className="truncate font-semibold text-l">{participants?.filter(p => p !== user!.username).join(", ")}</div>
      <div className="truncate">{latestMessage}</div>
    </Link>
  )
}

export default ConversationsPanel;