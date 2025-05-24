export interface StoreResponseInput {
  responseBody: Record<string, any>;
  idempotencyKey: string | undefined;
}