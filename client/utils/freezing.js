var ERROR_CODE = require("index.js").config.errorCode;
const FREEZING_TIME = ERROR_CODE.FREEZING_TIME
const promptFreezing = () => {
  const isFreezing = isFreezingTime()
    const currentPage = getCurrentPages().slice(-1)[0] 
  if (isFreezing && currentPage.data.isFreezing === undefined) {
    currentPage.setData({
      isFreezing: true
    })
  }
  return isFreezing
}
const verifyClientFreezing = () => {
  const interval = setInterval(() => {
    const currentPage = getCurrentPages().slice(-1)[0]
    if (currentPage) {
      promptFreezing()
      clearInterval(interval)
    }
  }, 500)
}
const isFreezingTime = () => {
  var a = new Date();
  // todo emulate 3 oclock
  a.setHours(3)
  var hour = a.getHours();
  return hour < 4;
}
const verifyFreezing = (statusCode) => {
  const isFreezing = statusCode === FREEZING_TIME
  if (isFreezing) {
    console.log('freezing')
    getCurrentPages().slice(-1)[0].setData({
      isFreezing: true
    })
    getCurrentPages().slice(-1)[0].setData({
      isToOpen: true
    })

  } else {
    getCurrentPages().slice(-1)[0].setData({
      isFreezing: false
    })
  }
  return isFreezing
}
const disbaleOperation=()=>{
  const isFreezing = isFreezingTime()
  if (isFreezing) {
    verifyFreezing(FREEZING_TIME)
  }
  return isFreezing
}
export { verifyClientFreezing, promptFreezing, verifyFreezing, isFreezingTime, disbaleOperation}