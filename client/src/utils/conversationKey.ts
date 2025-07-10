export const getConversationKey = (userA: number, userB: number): string => {
  const sorted = [userA, userB].sort((a, b) => a - b);
  return `${sorted[0]}-${sorted[1]}`;
}