export type CreateGigFormInputs = {
  title: string;
  price: number;
  description: string;
  file: Buffer;
}

export type Gig = {
  id: number;
  imgUrl: string;
  title: string;
  price: number;
  description: string;
  author: string;
  category: string | undefined;
}

export type GigImageProp = {
  imgUrl: string;
}