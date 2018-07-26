exports.config = {
  appId: 'wxcb754b6f12773e5c',
  secret: '6d72e9f5eec0df485f2e88c9ef5f2608',
  errorCode: {
    ACCESS_TOCKEN_EXPIRED: 401,
    DATA_NOT_FOUND: 404,
    INVALID_USER_STATUS: 409,
    HTTP_SUCCSESS: 200,
    CONNECTION_TIMEOUT: 503,
  },
  memeberStatus: {
    DELETED: 0,
    ACTIVE: 1,
    UNVERIFIED: 2,
    PENDING: 3,
    FROZEN: 4
  }
}

