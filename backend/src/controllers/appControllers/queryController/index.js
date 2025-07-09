const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const paginatedList = require('./paginatedList');
const addNote = require('./addNote');
const removeNote = require('./removeNote');

const methods = createCRUDController('Query');

methods.list = paginatedList;
methods.addNote = addNote;
methods.removeNote = removeNote;

module.exports = methods;
