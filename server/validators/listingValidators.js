const Joi = require('joi')

const createListingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be under 150 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().min(10).max(5000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required',
  }),
  location: Joi.string().trim().min(3).required().messages({
    'any.required': 'Location is required',
  }),
  rent: Joi.number().positive().required().messages({
    'number.positive': 'Rent must be a positive number greater than 0',
    'any.required': 'Rent is required',
  }),
  roomType: Joi.string()
    .valid('private-room', 'shared-room', 'studio', 'apartment', 'other')
    .required()
    .messages({
      'any.only': 'Invalid room type specification',
      'any.required': 'Room type is required',
    }),
  availableFrom: Joi.date().required().messages({
    'any.required': 'Available date is required',
  }),
  genderPreference: Joi.string()
    .valid('any', 'male', 'female', 'non-binary', 'couple')
    .default('any'),
  furnished: Joi.any().default(false), // string "true"/"false" or boolean
  amenities: Joi.any().default([]), // string or array
})

const updateListingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional(),
  description: Joi.string().trim().min(10).max(5000).optional(),
  location: Joi.string().trim().min(3).optional(),
  rent: Joi.number().positive().optional(),
  roomType: Joi.string()
    .valid('private-room', 'shared-room', 'studio', 'apartment', 'other')
    .optional(),
  availableFrom: Joi.date().optional(),
  genderPreference: Joi.string()
    .valid('any', 'male', 'female', 'non-binary', 'couple')
    .optional(),
  furnished: Joi.any().optional(),
  amenities: Joi.any().optional(),
  existingImages: Joi.any().optional(),
  removeImages: Joi.any().optional(),
})

module.exports = {
  createListingSchema,
  updateListingSchema,
}
