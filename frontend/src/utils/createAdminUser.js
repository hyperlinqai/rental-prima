import createUser from './createUser';

// Function to create an admin user
const createAdminUser = async () => {
  const email = 'admin@gmail.com';
  const password = 'password123';
  
  const userData = {
    name: 'Admin User',
    role: 'superadmin',
    status: 'active'
  };
  
  console.log(`Creating admin user with email: ${email}`);
  const result = await createUser(email, password, userData);
  
  if (result.success) {
    console.log('Admin user created successfully!');
    console.log('User ID:', result.user.id);
    console.log('User Profile:', result.profile);
  } else {
    console.error('Failed to create admin user:', result.message);
    if (result.error) {
      console.error('Error details:', result.error);
    }
  }
};

// Execute the function
createAdminUser();

export default createAdminUser;
