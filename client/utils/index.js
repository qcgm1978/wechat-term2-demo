exports.config = {
  appId: 'wx093196720f54b05b',
  secret: '9dd71eedcbed92bcb68f11e056c190dd',
  errorCode: {
    ACCESS_TOCKEN_EXPIRED: 401,
    DATA_NOT_FOUND: 404,
    INVALID_USER_STATUS: 409,
    HTTP_SUCCSESS: 200,
    CONNECTION_TIMEOUT: 503,
    REFRESH_ERR:500,
    FREEZING_TIME:419
  },
  memeberStatus: {
    DELETED: 0,
    ACTIVE: 1,
    UNVERIFIED: 2,
    PENDING: 3,
    FROZEN: 4
  }
}