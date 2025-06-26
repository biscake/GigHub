import { useContext } from "react";
import { MessageCacheContext } from "../context/MessageCacheContext";

export const useMessageCache = () => {
  const context = useContext(MessageCacheContext);

  if (!context) throw new Error("useChat must be used within an MessageCacheProvider");
  
  return context;
}