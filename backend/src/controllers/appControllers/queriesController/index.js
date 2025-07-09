const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const paginatedList = require('./paginatedList');
const addNote = require('./addNote');
const removeNote = require('./removeNote');
const mongoose = require('mongoose');

const methods = createCRUDController('Queries');
const Model = mongoose.model('Queries');

methods.list = (req, res) => paginatedList(Model, req, res);
methods.addNote = (req, res) => addNote(Model, req, res);
methods.removeNote = (req, res) => removeNote(Model, req, res);

module.exports = methods;
