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

    2019-01-16

    1，add num to gift popup

    2019-01-17

    可优惠10元，可送赠品，根据情况显示 @张红亮
进货单满减和满赠可享几个优惠：num promotionType==='2'
商品详情页满赠 点击立即购买 可选赠品页面打开@张红亮
当只有一个赠品时 勾选不可去掉 @张红亮
可送3种赠品 @张红亮
商品详情还可送5赠品@张红亮
选择赠品页面，赠品不可点击 @张红亮
赠品库存为0，勾选往后排 @张红亮
限额和限次超过了 返回特殊的status UI显示提示 @张红亮 @杨咏