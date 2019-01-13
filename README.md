## 积惠多B2B商城项目前端

### 微信小程序

## todo

different stores have diferent trolleys

exit login on memberDetail page

omit the trailing zero

change trolley num api request

order item to product detai; orderList item to order page; order confirm disable tap

min the len of order:1

409 status code indicates price changed

2018-12-25

- requireFlag judge

- "单品或单品类促销区分
1, 单品促销   2:单品类促销 3:系列促销  4:品牌促销   
    - 3,4: add field brandId/seriesCode
    - 送光了，售罄：根据商品是否为赠品确定

interface:
    1, 访销促销计算：返回促销列表，包括赠品列表: done

    2,选取单品、单品类组合： 增加了按系列、品牌分类

    3，商品促销列表： 3:系列促销  4:品牌促销

    4，促销可用额次：

    5, 进货单：add, list, remove,

    todo

    2019-01-11

    1，activity-trolley:(done) 
        show '赠品已赠完' if length===0
        show the gift inventoryCount isn't 0

    2, trolley:
        hide the add, minus btn if inventory is 0 (done)

        chrome://extensions/?id=jglfehaddibdnfchgicahpdifopgihcb