import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Message Central Setup Helper\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('Please create a .env.local file in your project root with the following variables:\n');
  
  console.log('# Database Configuration');
  console.log('MONGODB_URI=mongodb://localhost:27017/shivangi-battery\n');
  
  console.log('# JWT Configuration');
  console.log('JWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n');
  
  console.log('# Message Central Configuration');
  console.log('MESSAGE_CENTRAL_API_KEY=your-message-central-api-key');
  console.log('MESSAGE_CENTRAL_SENDER_ID=SHIVANGI');
  console.log('MESSAGE_CENTRAL_BASE_URL=https://console.messagecentral.com/api\n');
  
  console.log('# Application Configuration');
  console.log('NODE_ENV=development');
  console.log('NEXT_PUBLIC_API_URL=http://localhost:3000/api');
  
  process.exit(1);
}

// Read current .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current .env.local analysis:\n');

// Check for Fast2SMS variables
const fast2smsVars = {
  'FAST2SMS_API_KEY': envContent.includes('FAST2SMS_API_KEY'),
  'FAST2SMS_SENDER_ID': envContent.includes('FAST2SMS_SENDER_ID')
};

// Check for Message Central variables
const messageCentralVars = {
  'MESSAGE_CENTRAL_API_KEY': envContent.includes('MESSAGE_CENTRAL_API_KEY'),
  'MESSAGE_CENTRAL_SENDER_ID': envContent.includes('MESSAGE_CENTRAL_SENDER_ID'),
  'MESSAGE_CENTRAL_BASE_URL': envContent.includes('MESSAGE_CENTRAL_BASE_URL')
};

console.log('🔍 Fast2SMS Variables:');
Object.entries(fast2smsVars).forEach(([key, exists]) => {
  console.log(`   ${exists ? '✅' : '❌'} ${key}`);
});

console.log('\n🔍 Message Central Variables:');
Object.entries(messageCentralVars).forEach(([key, exists]) => {
  console.log(`   ${exists ? '✅' : '❌'} ${key}`);
});

// Migration recommendations
console.log('\n📝 Migration Recommendations:\n');

if (Object.values(fast2smsVars).some(exists => exists)) {
  console.log('🔄 Fast2SMS variables detected:');
  console.log('   1. Comment out or remove Fast2SMS variables');
  console.log('   2. Add Message Central variables');
  console.log('   3. Update your Message Central API key and sender ID\n');
}

if (!Object.values(messageCentralVars).every(exists => exists)) {
  console.log('➕ Missing Message Central variables:');
  
  if (!messageCentralVars['MESSAGE_CENTRAL_API_KEY']) {
    console.log('   - MESSAGE_CENTRAL_API_KEY: Get from Message Central dashboard');
  }
  
  if (!messageCentralVars['MESSAGE_CENTRAL_SENDER_ID']) {
    console.log('   - MESSAGE_CENTRAL_SENDER_ID: Set to "SHIVANGI" or your preferred sender ID');
  }
  
  if (!messageCentralVars['MESSAGE_CENTRAL_BASE_URL']) {
    console.log('   - MESSAGE_CENTRAL_BASE_URL: Set to "https://console.messagecentral.com/api"');
  }
  
  console.log('\n📋 Add these to your .env.local file:\n');
  console.log('# Message Central Configuration');
  console.log('MESSAGE_CENTRAL_API_KEY=your-message-central-api-key');
  console.log('MESSAGE_CENTRAL_SENDER_ID=SHIVANGI');
  console.log('MESSAGE_CENTRAL_BASE_URL=https://console.messagecentral.com/api');
}

// Next steps
console.log('\n🚀 Next Steps:\n');
console.log('1. Sign up at https://console.messagecentral.com');
console.log('2. Get your API key from the dashboard');
console.log('3. Configure your sender ID');
console.log('4. Update your .env.local file');
console.log('5. Test the integration: node scripts/test-message-central.mjs');
console.log('6. Check admin dashboard: http://localhost:3000/admin/message-central');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: MESSAGE_CENTRAL_SETUP.md');
console.log('- Migration Summary: MIGRATION_SUMMARY.md');
console.log('- Message Central Docs: https://console.messagecentral.com/docs');

console.log('\n✅ Setup helper completed!'); 