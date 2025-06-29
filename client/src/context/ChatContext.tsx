import { createContext } from "react";
import type { ChatContextType } from "../types/context";

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
