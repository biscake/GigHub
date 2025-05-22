export type CreateGigFormInputs = {
  title: string;
  price: number;
  description: string | undefined;
  file: Buffer;
}