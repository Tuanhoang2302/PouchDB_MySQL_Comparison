const express = require('express')
const router = express.Router();
var PouchDB = require('pouchdb');
var db = new PouchDB("gg")

var schema = require('../schema')
db.setSchema(schema)

router.get('/deleteAll', async (req, res) => {
    db.allDocs({include_docs: true}).then(allDocs => {
      return allDocs.rows.map(row => {
        return {_id: row.id, _rev: row.doc._rev, _deleted: true};
      });
    }).then(deleteDocs => {
      return db.bulkDocs(deleteDocs);
    });
    res.send("success delete")
  })


router.get('/customerById', async (req, res) => {
    await db.rel.find('customer', 1).then(async (data) => {
        // data.customers.map(async (item) => {
          await db.rel.del('customers', {
            id:data.customers[0].id, 
            rev:data.customers[0].rev
        }).then((result) => res.send(result));
        //})
      })
    //res.send("succes")
})

router.get('/customerBulk', async (req, res) => {
  const numberToDelete = 10000
    for(let i = 1; i <= numberToDelete; i++){
    await db.rel.find('customer', 'add_'+i).then(async (data) => {
      // data.customers.map(async (item) => {
        await db.rel.del('customers', {
          id:data.customers[0].id, 
          rev:data.customers[0].rev
      })
      //})
    })
  }
  res.send("succes")
})

module.exports = router