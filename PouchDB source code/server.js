var PouchDB = require('pouchdb');
var express = require('express');
var app = express();
PouchDB.plugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('relational-pouch'));
PouchDB.plugin(require('pouchdb-find'));

 
app.use('/', require('./routers/create'))
app.use('/delete', require('./routers/delete'))
app.use('/find', require('./routers/find'))
app.use('/add', require('./routers/add'))
app.use('/update', require('./routers/update'))
app.listen(3000);
