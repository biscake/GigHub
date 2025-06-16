export interface StoreCiphertextInDbParams {
  ciphertext: string;
  senderId: number;
  receipientId: number;
}

export interface MarkMessageIdArrayAsReadParams {
  messageIds: string[];
  receipientId: number;
}


export interface GetSenderIdByMessageIdParams {
  messageIds: string[];
}