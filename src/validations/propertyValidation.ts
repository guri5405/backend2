import Joi from 'joi';
import type { ApplyToPropertyInput, CreatePropertyInput, ListPropertiesQuery, UpdatePropertyInput } from '../types/dto';

export const createProperty: Joi.ObjectSchema<CreatePropertyInput> = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  address: Joi.string().trim().min(5).max(500).required(),
  rentAmount: Joi.number().positive().precision(2).required(),
  bedrooms: Joi.number().integer().min(0).max(50).required(),
  bathrooms: Joi.number().integer().min(0).max(50).required(),
});

export const updateProperty: Joi.ObjectSchema<UpdatePropertyInput> = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(5000),
  address: Joi.string().trim().min(5).max(500),
  rentAmount: Joi.number().positive().precision(2),
  bedrooms: Joi.number().integer().min(0).max(50),
  bathrooms: Joi.number().integer().min(0).max(50),
  status: Joi.string().valid('active', 'rented'),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided to update' });

export const listPropertiesQuery: Joi.ObjectSchema<ListPropertiesQuery> = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  minRent: Joi.number().min(0),
  maxRent: Joi.number().min(0),
  bedrooms: Joi.number().integer().min(0),
  status: Joi.string().valid('active', 'rented'),
  sortBy: Joi.string().valid('rentAmount', 'createdAt', 'bedrooms', 'bathrooms', 'title'),
  order: Joi.string().valid('asc', 'desc'),
});

export const applyToProperty: Joi.ObjectSchema<ApplyToPropertyInput> = Joi.object({
  message: Joi.string().trim().max(2000).allow('', null),
});

export default { createProperty, updateProperty, listPropertiesQuery, applyToProperty };
