const { query } = require('express');
const express = require('express')
const router = express.Router();
var PouchDB = require('pouchdb');
var db = new PouchDB("gg")
var schema = require('../schema')
db.setSchema(schema)

router.get('/totalOrdersOfOneCustomer', async (req, res) => {
    var customerName = req.query.name
    var resultForm = {}
    await db.find({
        selector:{
            'data.customer_name': customerName//"Jany Price",
        },
        //limit: 100,
    }).then(async (datas) => {
        var listOrder = []
        for(let i = 0; i < datas.docs.length; i++){
            let idObj = db.rel.parseDocID(datas.docs[i]._id);

            await db.find({
                selector:{
                    'data.customer': {$eq: idObj.id} 
                },
            }).then((orderData) => {
                var tempForm = {
                    numberOfOrder: orderData.docs.length,
                    customer_name: datas.docs[i].data.customer_name,
                    customer_email: datas.docs[i].data.customer_email,
                    
                }
                listOrder.push(tempForm)
            })
        }
        resultForm['total_valid_customer'] = listOrder.length
        resultForm['customer'] = listOrder
    })
    console.log(resultForm)
    res.send(resultForm)
})

router.get('/customerbyName', async (req, res) => {
    var customerName = req.query.name
    db.find({
        selector: {
            'data.customer_name' : customerName
        }
    }).then((data) => {
        console.log(data);
        res.send(data)
    })
    
})

router.get('/quantity', async (req, res) => {
    var customerName = req.query.name
    db.find({
        selector: {
            'data.quantity_order' : {$gt: 50},
        }, limit: 100000,use_index:['quantityOrder']
    }).then((data) => {
        console.log(data);
        res.send(data)
    })
    
})

router.get('/customerbyId', async (req, res) => {
    var customerId = parseInt(req.query.id)
    db.rel.find('order', customerId).then((data) => {
        res.send(data)
    })
})


router.get('/customerByCarModel', async (req, res) => {
    var car_make = req.query.car_make
    var car_model = req.query.car_model
    const range = 1000
    db.find({
        selector:{
            'data.car_make': car_make,
            'data.car_model': car_model
        },
    }).then((carData) => {
        var carDetail = carData.docs[0]
        let carIdJson = db.rel.parseDocID(carDetail._id);
        
        db.find({
            selector:{
                'data.car': {$eq: carIdJson.id}
            },
            //limit: range
        }).then(async (orderDetailData) => {
            var customerIdList = []
            var customerList = []
            for(let i = 0; i < orderDetailData.docs.length; i++){
                var orderId= db.rel.makeDocID({ 
                    "type": "order", 
                    "id": orderDetailData.docs[i].data.order
                });
                
                await db.get(orderId).then((orderData) => {
                    customerIdList.push(orderData.data.customer)
                })
            }

            for(let i = 0; i < customerIdList.length; i++){
                var customerId= db.rel.makeDocID({ 
                    "type": "customer", 
                    "id": customerIdList[i]
                });
                
                await db.get(customerId).then((customerData) => {
                    var temp = {
                        customer_name: customerData.data.customer_name,
                        customer_email: customerData.data.customer_email,
                    }
                    customerList.push(temp)
                })
            }
            
            res.send(customerList)
        })
    })
})


router.get("/totalQuantityOrderPerCus", async (req,res) => {
    var customerName = req.query.name
    db.find({
        selector: {
            'data.customer_name' : customerName
        }
    }).then(async (cusData) => {
        var customerDetail = []
        
        for(let i = 0; i < cusData.docs.length; i++){
            let cusIdJson = db.rel.parseDocID(cusData.docs[i]._id);
            var totalOrder = 0;
            await db.find({
                selector: {
                    'data.customer': cusIdJson.id
                }
            }).then(async (orderData) => {
                for(let i = 0; i < orderData.docs.length; i++){
                    var orderDetailIdJson = db.rel.parseDocID(orderData.docs[i]._id);
                    var orderDetailId= db.rel.makeDocID({ 
                        "type": "orderdetail", 
                        "id": orderDetailIdJson.id
                    });

                    await db.get(orderDetailId).then((orderDetailData) => {
                        totalOrder += orderDetailData.data.quantity_order
                    })
                }

                var temp = {
                    customer_name: cusData.docs[i].data.customer_name,
                    customer_email: cusData.docs[i].data.customer_email,
                    total_quantity_order: totalOrder
                }
                customerDetail.push(temp)
            })
        }

        res.send(customerDetail)
    })
})

router.get('/test', async (req, res) => {
    await db.allDocs({startkey: 'add_', endkey: 'add_\uffff'}).then(async(data) => {
        return data.rows.map(row => {
            return { _id: row.id, _rev: row.value.rev, _deleted: true };
        })
    }).then(async (deleteDocs) => {
        await db.bulkDocs(deleteDocs);
    })
    console.log("success");
    res.send("success")
})

module.exports = router