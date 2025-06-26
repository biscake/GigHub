import type { CachedDecryptedMessage } from "./chat";

export interface MessageInputProps {
  conversationKey: string;
}

export interface ConversationTabProps {
  latestMessage: string;
  conversationKey: string;
  title?: string;
  otherUsername?: string;
}

export interface ConversationsProps {
  setOtherUsername: React.Dispatch<React.SetStateAction<string>>;
  setOtherUserId: React.Dispatch<React.SetStateAction<number | null>>;
}

export interface MessagesContainerProps {
  conversationKey: string;
  otherUsername: string;
}

export interface MessageProps {
  message: CachedDecryptedMessage;
  otherUsername: string;
}

export interface ConversationMessageContainerProps {
  conversationKey: string | null;
}

export interface NewConversationButtonProps {
  setStartConversation: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface StartConversationWithPanelProps {
  setOtherUsername: React.Dispatch<React.SetStateAction<string>>;
}

export interface NewConversationUserProps {
  user: {
    username: string;
    userId: number;
    profilePictureUrl: string;
    bio: string | null;
  };
  setOtherUsername: React.Dispatch<React.SetStateAction<string>>;
  setOtherUserId: React.Dispatch<React.SetStateAction<number | null>>;
}