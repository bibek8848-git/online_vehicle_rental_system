export const config = {
    jwtKey: {
        jwtKey: process.env.JWT_SECRET,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
    database: {
        dbUrl: process.env.DATABASE_URL,
    },
    admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },
    esewa: {
        merchantCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
        secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
        testUrl: process.env.ESEWA_API_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        successUrl: process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/api/payment/success',
        failureUrl: process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/api/payment/failure',
    },
    adminEsewa: process.env.ADMIN_ESEWA_NUMBER || '9812345678',
};
