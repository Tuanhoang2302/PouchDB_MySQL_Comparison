const express = require('express')
const router = express.Router();
var PouchDB = require('pouchdb');
var db = new PouchDB("gg")

var schema = require('../schema')
db.setSchema(schema)

router.get('/customer', async (req, res) => {
    await db.rel.save('customer', {
        id: 1,
        customer_name:"Eldora Stark",
        customer_email: "Kassandra.Ritchie@gmail.com",
        customer_address: "206 Marina Underpass"
    }).then((resutl) => res.send(resutl))
})
router.get('/customerBulk', async (req, res) => {
    const numberToAdd = 100000
    var arrayOfCustomer = []
    for(let i = 0; i < numberToAdd; i++){    
        await db.rel.save('customer', {
          id: "add" + (i+1).toString(),
          customer_name: customer['customer_name'],
          customer_email: customer["customer_email"],
          customer_address: customer['customer_address'],
        })
      }
      console.log(arrayOfCustomer)
      res.send("success")
})
module.exports = router