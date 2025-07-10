import { useEffect, useState } from "react";
import ConversationsPanel from "./ConversationsPanel";
import { useSearchParams } from "react-router-dom";
import ConversationMessage from "./ConversationMessages";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [displayConversation, setDisplayConversation] = useState<string | null>(searchParams.get('conversationKey'));

  useEffect(() => {
    setDisplayConversation(searchParams.get('conversationKey'));
  }, [searchParams]);

  return (
    <div className="w-full h-full flex">
      <ConversationsPanel />
      <ConversationMessage conversationKey={displayConversation}/>
    </div>
  )
}

export default Chat;