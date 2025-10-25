import { checkSchema } from 'express-validator'
export default checkSchema({
  email: {
    errorMessage: 'Email is invalid',
    notEmpty: true,
    trim: true,
  },
  firstName: {
    errorMessage: 'First name is required',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'Last name is required',
    notEmpty: true,
    trim: true,
  },
  password: {
    errorMessage: 'Password is required',
    notEmpty: true,
    trim: true,
  },
})
