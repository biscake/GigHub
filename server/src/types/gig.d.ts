export type CreateGigInDatabaseInput = {
  imgKey: string;
  title: string;
  price: number;
  description: string | undefined;
  authorId: Integer;
}