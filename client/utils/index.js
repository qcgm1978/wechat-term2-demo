exports.config = {
  appId: 'wx44aeb10d0359834d',
  secret: 'c7b1b90cb7d31d3e24687558d88a40e8',
  errorCode: {
    ACCESS_TOCKEN_EXPIRED: 401,
    DATA_NOT_FOUND: 404,
    INVALID_USER_STATUS: 409,
    HTTP_SUCCSESS: 200,
    CONNECTION_TIMEOUT: 503,
    REFRESH_ERR:500,
    FREEZING_TIME:406
  },
  memeberStatus: {
    DELETED: 0,
    ACTIVE: 1,
    UNVERIFIED: 2,
    PENDING: 3,
    FROZEN: 4
  }
}