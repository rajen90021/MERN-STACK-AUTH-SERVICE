import { checkSchema } from 'express-validator'

export default checkSchema({
    name: {
      errorMessage: 'Name is required',
      notEmpty: true,
      trim: true,
    },
    address: {
      errorMessage: 'Address is required',
      notEmpty: true,
      trim: true,
    },
})