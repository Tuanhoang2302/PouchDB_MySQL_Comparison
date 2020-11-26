const express = require('express')
const router = express.Router();
var PouchDB = require('pouchdb');
var db = new PouchDB("gg")

var schema = require('../schema')
db.setSchema(schema)

router.get('/customer', async (req, res) => {
    await db.allDocs({startkey: 'add_', endkey: 'add_\uffff'}).then(async(data) => {
        return data.rows.map(row => {
            return { _id: row.id, _rev: row.value.rev, 'data.customer_name': "htm"};
        })
    })
    console.log("success");
    res.send("success")
})
module.exports = router