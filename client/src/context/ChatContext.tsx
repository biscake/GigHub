import { createContext } from "react";
import type { ChatContextType } from "../types/chat";

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
