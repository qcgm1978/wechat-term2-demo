export default {
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('map');
    
  },
  getCenterLocation: function() {
    this.mapCtx.getCenterLocation({
      success: function(res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    });
    
  },
  getPos() {
    const that = this;
    wx.getLocation({
      success(pos) {
        // test data set offset variable
        const offset=0.2
        that.setData({
          pos,
          markers: [{
            id: 1,
            latitude: pos.latitude - offset,
            longitude: pos.longitude - offset,
            // callout:{
            //   content:'shop1'
            // },
            label: {
              content: 'shop1',
              textAlign: "center",
              // anchorX: pos.longitude - 0.02,
              // anchorY: 39.9279,
              // padding:0.5
            },
            name:'shop1'
          }, {
            id: 2,
              latitude: pos.latitude + 0.01,
              longitude: pos.longitude + 0.01,
            label: {
              content: 'shop2'
            },
            name: 'shop2'
          }]
        });
        that.mapCtx.includePoints({
          points: [{
            latitude: pos.latitude - offset,
            longitude: pos.longitude - offset,
          }, {
            latitude: pos.latitude + 0.01,
            longitude: pos.longitude + 0.01
          }]
        });
      }
    });
    
  },
  bindMapTap() {
    debugger;
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  }
}