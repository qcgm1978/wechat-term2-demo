exports.config = {
   appId : 'wx00d1d53802723dab',
   secret : '0054c524615772331ef1f2b5a027bc36',
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

