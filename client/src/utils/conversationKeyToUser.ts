export const convertKeyToUserId = (conversationKey: string): { userId: number, otherUserId: number} => {
  const split = conversationKey.split("-");
  return {
    userId: parseInt(split[0]),
    otherUserId: parseInt(split[1])
  }
}