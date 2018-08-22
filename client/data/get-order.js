module.exports = {
  "status": 200,
  "message": "OK",
  "result": {
    "orderId": "123456",
    "orderStatus": "UNPAY",
    "totalAmount": 8,
    "itemTotalCount": 2,
    "createTime": "2018-08-21 13:25:45",
    "payment": {
      "paymentId": "e5ad2fd7a50211e88eb3cdc5dc8b7f3b",
      "paymentMethod": "COD",
      "paymentTime": "2018-08-21 13:25:45",
      "usePoint": 3,
      "cashAmount": 8
    },
    "orderItem": [
      {
        "itemId": "9503c54ba50211e8969e09fe0c96017b",
        "itemSku": "222222",
        "itemName": "雪碧",
        "quantity": 1,
        "unitPrice": 4.5,
        "locationId": "2",
        "returnQuantit": 0,
        "itemIcon": null
      },
      {
        "itemId": "8e163dfea50211e8bb72c5949b847d3c",
        "itemSku": "111111",
        "itemName": "可乐",
        "quantity": 1,
        "unitPrice": 3.5,
        "locationId": "2",
        "returnQuantit": 0,
        "itemIcon": null
      }
    ],
    "orderReturn": null
  }
}