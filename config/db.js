var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Global Plugins
// mongoose.plugin(aggregatePaginate);

mongoose.set("strictQuery", true);

async function createDefaultAdmin() {
  try {
    const UserModel = mongoose.model('users');

    // Check if admin exists
    const adminExists = await UserModel.findOne({ role: 'admin' });
    if (!adminExists) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('321321', 10);

      // Create admin user
      const adminUser = new UserModel({
        phone: 9033251903,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });

      await adminUser.save();
      console.log('Default admin user created');
    }
  } catch (err) {
    console.log('Error creating default admin:', err);
  }
}

// Connect to DB
mongoose.connect(`${process.env.DATABASE_URL}syt_db`)
  .then(async () => {
    console.log(`DB : Connected`);

    // Log database details
    const db = mongoose.connection.db;

    try {
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));

      // Wait for models to be registered
      setTimeout(async () => {
        try {
          // Create default admin if doesn't exist
          await createDefaultAdmin();

          // Check users collection after admin creation
          const users = await db.collection('users').find({}).toArray();
          console.log('Users in database:', JSON.stringify(users, null, 2));
        } catch (err) {
          console.log('Error in delayed operations:', err);
        }
      }, 1000); // Wait for 1 second to ensure models are registered

    } catch (err) {
      console.log('Error checking database:', err);
    }
  })
  .catch((err) => {
    console.log(`DB : Error - ${err.message}`);
  }); module.exports = mongoose;
