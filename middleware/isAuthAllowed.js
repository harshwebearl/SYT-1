/**
 * Authorization middleware to check if user has required role/permissions
 * @param {string|string[]} allowedRoles - Role or array of roles that are allowed to access the route
 */
module.exports = (allowedRoles) => {
  // Convert single role to array and ensure lowercase for comparison
  const allowedRolesArr = Array.isArray(allowedRoles)
    ? allowedRoles.map(role => role.toLowerCase())
    : [allowedRoles?.toLowerCase()].filter(Boolean);

  // If no roles specified, default to allowing all authenticated users
  const defaultRoles = ['admin', 'agency', 'customer', 'member'];
  const finalAllowedRoles = allowedRolesArr.length > 0 ? allowedRolesArr : defaultRoles;

  return async (req, res, next) => {
    try {
      // STEP 1: Check Authentication Status
      console.log('\n==== 🛡️ AUTHORIZATION CHECK ====');
      console.log('1️⃣ Checking authenticated status');
      console.log('Allowed roles:', finalAllowedRoles);

      if (!req.userData) {
        console.log('❌ No user data found - authentication required');
        return res.status(401).json({
          status: false,
          message: "Authorization failed",
          error: "Authentication required",
          howToFix: "Please login first to access this resource"
        });
      }

      // STEP 2: Validate User Role
      console.log('\n2️⃣ Validating user role');
      const userRole = (req.userData.role || '').toLowerCase();
      console.log('User role:', userRole);

      if (!userRole) {
        console.log('❌ No role found in user data');
        return res.status(403).json({
          status: false,
          message: "Authorization failed",
          error: "No role specified",
          howToFix: "Contact administrator to assign a role"
        });
      }

      // STEP 3: Check Role Authorization
      console.log('\n3️⃣ Checking role permissions');
      const isAllowed = finalAllowedRoles.includes(userRole);
      console.log('Authorization check:', isAllowed ? '✅ Allowed' : '❌ Denied');

      if (!isAllowed) {
        console.log('❌ Access denied for role:', userRole);
        return res.status(403).json({
          status: false,
          message: "Access denied",
          error: "Insufficient permissions",
          details: {
            userRole: userRole,
            requiredRoles: finalAllowedRoles
          },
          howToFix: "Request access from administrator for required role"
        });
      }

      // STEP 4: Authorization Successful
      console.log('\n4️⃣ Authorization successful');
      console.log('User:', {
        id: req.userData.id,
        role: userRole,
        timestamp: new Date().toISOString()
      });
      console.log('==== 🛡️ AUTHORIZATION COMPLETE ====\n');
      next();

    } catch (error) {
      console.log('❌ Authorization middleware error:', {
        error: error.message,
        stack: error.stack
      });
      return res.status(403).json({
        status: false,
        message: "Authorization failed",
        error: "Internal authorization error",
        details: error.message
      });
    }
  };
};
