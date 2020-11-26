var PouchDB = require('pouchdb');
var db = new PouchDB("todos")

var schemaData = [
    {
      singular:'customer',
      plural:'customers',
      relations:{
        'orders':  {hasMany: "order"}
      }
    },

    {
      singular:'order',
      plural:"orders",
      relations:{
        'customer': {belongsTo:'customer'},
        'orderdetail':{belongsTo:'orderdetail'}
      }
    },

    {
      singular:'orderdetail',
      plural:'orderdetails',
      relations:{
        'order': {belongsTo:'order'},
        'car':{belongsTo: "car"}
      }
    },

    {
      singular:"car",
      plural:"cars",
      relations:{
        'orderdetails' : {hasMany:"orderdetails"}
      }
    }
]

module.exports = schemaData