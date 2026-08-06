const { pool } = require('../config/database');

async function runTest() {
  try {
    console.log('Connecting to database via pool...');

    // 1. Get first property owner user ID
    const [owners] = await pool.execute('SELECT user_id FROM property_owners LIMIT 1');
    if (owners.length === 0) {
      console.log('No property owners found to test with.');
      process.exit(0);
    }
    const userId = owners[0].user_id;
    console.log(`Using owner user ID: ${userId}`);

    // 2. Perform manual update test query simulating PUT /profile
    console.log('Simulating profile update...');
    await pool.execute(`
      UPDATE property_owners
      SET mfs_provider = ?, mfs_wallet_number = ?, mfs_account_name = ?, updated_at = NOW()
      WHERE user_id = ?
    `, ['bkash', '01876543210', 'Test Owner Wallet Name', userId]);

    // 3. Verify
    console.log('Retrieving updated details...');
    const [result] = await pool.execute(`
      SELECT mfs_provider, mfs_wallet_number, mfs_account_name 
      FROM property_owners 
      WHERE user_id = ?
    `, [userId]);

    const updated = result[0];
    console.log('Verification details returned from DB:', updated);

    if (updated.mfs_provider === 'bkash' && 
        updated.mfs_wallet_number === '01876543210' && 
        updated.mfs_account_name === 'Test Owner Wallet Name') {
      console.log('🎉 DB update and retrieval verification SUCCESSFUL!');
    } else {
      console.error('❌ Verification FAILED: details do not match!');
    }

    // Clean up
    await pool.execute(`
      UPDATE property_owners
      SET mfs_provider = NULL, mfs_wallet_number = NULL, mfs_account_name = NULL, updated_at = NOW()
      WHERE user_id = ?
    `, [userId]);
    console.log('Database cleaned up.');

    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTest();
