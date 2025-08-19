const jwt = require("jsonwebtoken");

/**
 * Authentication middleware to verify JWT tokens
 * Excludes login routes from authentication
 */
module.exports = (req, res, next) => {
  try {
    // STEP 1: Check for public routes that don't need authentication
    const publicRoutes = [
      '/admin/login',
      '/user/loginAll',
      '/admin/send-otp',
      '/admin/verify-otp',
      '/admin/forgetPassword'
    ];

    // Skip authentication for public routes
    if (publicRoutes.includes(req.path)) {
      console.log('🔓 Skipping auth for public route:', req.path);
      return next();
    }

    // Log request details
    console.log('\n==== 🔐 AUTH MIDDLEWARE DEBUG ====');
    console.log('1️⃣ Request Details:', {
      url: req.url,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    // STEP 2: Check for Authorization header
    const bearerHeader = req.headers['authorization'];
    console.log('\n2️⃣ Authorization Header Check:');
    console.log('Authorization header value:', bearerHeader);

    // Check if bearer is undefined
    if (!bearerHeader) {
      console.log('❌ No Authorization header found');
      return res.status(401).json({
        status: false,
        message: "Authentication failed",
        error: "Missing Authorization header",
        howToFix: "Add 'Authorization: Bearer your_token' to request headers"
      });
    }

    // STEP 3: Extract and validate token format
    console.log('\n3️⃣ Token Extraction:');
    console.log('Raw header:', bearerHeader);

    const bearer = bearerHeader.split(' ');
    console.log('Split parts:', bearer);

    // Validate Bearer format
    if (bearer[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        status: false,
        message: "Authentication failed",
        error: "Invalid header format",
        howToFix: "Authorization header must start with 'Bearer '"
      });
    }

    const token = bearer[1];
    console.log('Extracted token:', token ? token.substring(0, 15) + '...' : 'none');

    // STEP 4: Validate Token Format
    console.log('\n4️⃣ Token Format Check:');
    if (!token) {
      console.log('❌ No token found after extraction');
      return res.status(401).json({
        status: false,
        message: "Authentication failed",
        error: "Token not found",
        howToFix: "Ensure token is provided after 'Bearer ' in Authorization header"
      });
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('❌ Invalid token structure');
      return res.status(401).json({
        status: false,
        message: "Authentication failed",
        error: "Invalid token format",
        howToFix: "Token must be a valid JWT with three parts (header.payload.signature)"
      });
    }
    console.log('✅ Token format is valid (header.payload.signature)');

    // STEP 5: Token Verification
    console.log('\n5️⃣ Token Verification:');

    // Try to decode header and payload for debugging
    try {
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      console.log('Token header:', header);
    } catch (e) {
      console.log('Warning: Could not decode token header');
    }

    const jwtSecret = process.env.JWT_SECRET || 'asd';
    console.log('Verifying with secret:', jwtSecret.substring(0, 3) + '...');

    jwt.verify(token, jwtSecret, (err, authData) => {
      if (err) {
        console.log('❌ Verification failed:', {
          errorType: err.name,
          message: err.message,
          tokenStart: token.substring(0, 20)
        });

        const errorInfo = {
          status: false,
          message: "Authentication failed",
          error: "Token verification failed",
          details: err.message,
          errorType: err.name
        };

        // Add specific troubleshooting guidance
        switch (err.name) {
          case 'TokenExpiredError':
            errorInfo.howToFix = "Your session has expired. Please login again to continue.";
            break;
          case 'JsonWebTokenError':
            if (err.message === 'invalid signature') {
              errorInfo.howToFix = "Token signature is invalid. Ensure you're using the correct token from your last login.";
            } else {
              errorInfo.howToFix = "The token is invalid. Try logging in again to get a new token.";
            }
            break;
          default:
            errorInfo.howToFix = "Please try logging in again. If the problem persists, contact support.";
        }

        return res.status(401).json(errorInfo);
      }

      // STEP 6: Success Case
      console.log('\n6️⃣ Verification Successful!');
      console.log('Token data:', {
        userId: authData.id,
        role: authData.role,
        iat: new Date(authData.iat * 1000).toISOString(),
        exp: new Date(authData.exp * 1000).toISOString()
      });

      // Attach decoded data to request
      req.userData = authData;
      console.log('\n==== 🔐 AUTH CHECK COMPLETE ====\n');
      next();
    });
  } catch (error) {
    console.log('❌ Auth middleware error:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(401).json({
      status: false,
      message: "Authentication failed",
      error: "Internal error",
      details: error.message,
      howToFix: "Please try again. If the problem persists, contact support."
    });
  }
};