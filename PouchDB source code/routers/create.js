const express = require('express')
const router = express.Router();
var PouchDB = require('pouchdb');
var db = new PouchDB("gg")
const ObjToCsv = require('objects-to-csv');

var schema = require('../schema')
db.setSchema(schema)
var faker = require('faker');
const { keys } = require('../schema');
numberOfOrders = Math.pow(10, 8);
numberOfCar = 1000
numberOfCustomer = Math.pow(10, 6)

router.get('/createCar', async (req, res) => {
    db.setSchema(schema)
    const csvFilePath='./car.csv'
    const csv=require('csvtojson')
    const jsonArray=await csv().fromFile(csvFilePath);
    for(let i = 0; i < numberOfCar; i++) {
      var car = {}
      
      car['car_id'] = i + 1,
      car['car_model'] = jsonArray[i].car_model
      car['car_make'] = jsonArray[i].car_make
      car['car_model_year'] = jsonArray[i].car_model_year
      
      await db.rel.save('car', {
        id: i + 1,
        car_model: car['car_model'],
        car_make: car['car_make'],
        car_model_year: car['car_model_year'],
      })
      car = null;
    }

    res.send("success")
})

router.get('/createCustomer', async (req, res) => {
  for(let i = 0; i < numberOfCustomer; i++){
    customer = {}
    customer['_id'] = "add_" + (i+1).toString()
    customer['customer_name'] = faker.name.firstName() + " " + faker.name.lastName()
    customer['customer_email'] = faker.internet.email()
    customer['customer_address'] = faker.address.streetAddress()

    await db.rel.save('customer', {
      id: "add_" + (i+1).toString(),
      customer_name: customer['customer_name'],
      customer_email: customer["customer_email"],
      customer_address: customer['customer_address'],
    })
  }
  res.send("success")
})

router.get('/createOrder', async (req, res) => {
  for(let i = 0; i < numberOfOrders; i++) {
    var order = {}
    order['customer_id'] = faker.random.number({
      min:1,
      max: numberOfCustomer
    })
    order['order_id'] = i + 1

    await db.rel.save('order', {
      id: i + 1,
      customer: order['customer_id']
    })
  }
  res.send("success")
})

router.get('/createOrderdetail', async (req, res) => {
  for(let i = 0; i < numberOfOrders; i++){
    var orderdetails = {}
    orderdetails['order_id'] = i +1,
    orderdetails['car_id'] = faker.random.number({
      min: 1,
      max: numberOfCar
    })
    orderdetails['quantity_order'] = faker.random.number({
      min: 10,
      max: 100
    })
    await db.rel.save('orderdetail', {
      id: i + 1,
      order: orderdetails['order_id'],
      car: orderdetails['car_id'],
      quantity_order: orderdetails['quantity_order']
    })

    orderdetails = null
  }

  res.send('success')
})



router.get('/customerToCSV', async(req, res) => {
  const range = 1000
  for(let i = 1; i <= numberOfCustomer / range; i++) {
    var start = range * (i - 1) + 1
    var end = range * i
    var list = []
    
    await db.rel.find('customer', {
      startkey:start,
      limit: range
    }).then(async (data) => {
      for(let m = 0; m < range; m++){
        var newForm = {
          customer_name: data.customers[m].customer_name,
          customer_email: data.customers[m].customer_email,
          customer_address: data.customers[m].customer_address,
          customer_id: data.customers[m].id
        }
        list.push(newForm)
      }
      const csv = new ObjToCsv(list);
      await csv.toDisk('./customer.csv', { append: true });
      
    })
    
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`approximately ${Math.round(used * 100) / 100} MB`);
  }
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`finish ${Math.round(used * 100) / 100} MB`);
  res.send('success')
})

router.get('/orderToCSV', async(req, res) => {
  const range = 1000
  for(let i = 1; i <= numberOfOrders / range; i++) {
    var start = range * (i - 1) + 1
    var end = range * i
    var list = []
    
    await db.rel.find('order', {
      startkey:start,
      limit: range
    }).then(async (data) => {
      for(let m = 0; m < range; m++){
        
        var newForm = {
          order_id: data.orders[m].id,
          customer_id: data.orders[m].customer
        }
        list.push(newForm)
      }
      console.log(i)
      const csv = new ObjToCsv(list);
      await csv.toDisk('./order.csv', { append: true });
      
    })
    
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`approximately ${Math.round(used * 100) / 100} MB`);
  }
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`finish ${Math.round(used * 100) / 100} MB`);
  res.send('success')
})


router.get('/orderdetailToCSV', async(req, res) => {
  const range = 1000
  for(let i = 1; i <= numberOfOrders / range; i++) {
    var start = range * (i - 1) + 1
    var end = range * i
    var list = []
    
    await db.rel.find('orderdetail', {
      startkey:start,
      limit: range
    }).then(async (data) => {
      for(let m = 0; m < range; m++){
        var newForm = {
          order_id: data.orderdetails[m].order,
          car_id: data.orderdetails[m].car,
          quantity_order: data.orderdetails[m].quantity_order
        }
        list.push(newForm)
      }
      const csv = new ObjToCsv(list);
      await csv.toDisk('./orderdetail.csv', { append: true });
      
    })
    console.log(i)
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`approximately ${Math.round(used * 100) / 100} MB`);
  }
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`finish ${Math.round(used * 100) / 100} MB`);
  res.send('success')
})


module.exports = router 