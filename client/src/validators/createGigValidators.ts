import type { InputValidation, TextAreaValidation } from "../types/validators";

export const titleValidation: InputValidation = {
  name: "title",
  type: "text",
  id: "title", 
  placeholder: "Title",
  validation: {
    required: {
      value: true,
      message: "Title required"
    },
    minLength: {
      value: 3,
      message: "Title must be at least 3 characters long"
    },
  }
}

export const priceValidation: InputValidation = {
  name: "price",
  type: "number",
  id: "price",
  min: 0,
  step: 0.5,
  placeholder: "Price",
  validation: {
    required: {
      value: true,
      message: "Title required"
    },
    pattern: {
      value: /^0\d/,
      message: "Cannot start with 0"
    },
  }
}

export const descriptionValidator: TextAreaValidation = {
  name: "description",
  placeholder: "Give a short description of your gig",
  validation: {
    required: {
      value: true,
      message: "Description required"   
    },
    minLength: {
      value: 10,
      message: "Description must be at least 10 character long"
    }
  }
}
