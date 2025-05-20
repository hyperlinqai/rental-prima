import supabase from './utils/supabaseClient.js';
// If the above path doesn't work, let's look for the correct path

// Function to test if parent_id field exists in the categories table
async function testParentCategoryField() {
  console.log('Testing if parent_id field exists in categories table...');
  
  try {
    // Try to fetch a single category with parent_id field
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .limit(1);
    
    if (error) {
      console.error('Error querying database:', error);
      return false;
    }
    
    console.log('Query result:', data);
    
    // Check if parent_id is present in the returned data structure
    if (data && data.length > 0) {
      const hasParentIdField = 'parent_id' in data[0];
      console.log('parent_id field exists:', hasParentIdField);
      return hasParentIdField;
    } else {
      console.log('No categories found, but query was successful');
      return true; // Query worked, just no data
    }
  } catch (error) {
    console.error('Exception when testing parent_id field:', error);
    return false;
  }
}

// Run the test
testParentCategoryField()
  .then(result => {
    console.log('Test result:', result ? 'Success! parent_id field exists' : 'Failed: parent_id field does not exist');
  })
  .catch(err => {
    console.error('Test failed with error:', err);
  });
