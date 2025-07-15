#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureMessageCentral() {
  console.log('🔧 Message Central Configuration Setup\n');
  console.log('This script will help you configure Message Central for your Shivangi Battery application.\n');

  // Get configuration details
  const apiKey = await question('Enter your Message Central API Key: ');
  const senderId = await question('Enter your Sender ID (e.g., SHIVANGI): ');
  const templateId = await question('Enter your DLT Template ID (optional, press Enter to skip): ');
  const baseUrl = await question('Enter Message Central API Base URL (default: https://console.messagecentral.com/api): ') || 'https://console.messagecentral.com/api';

  // Validate inputs
  if (!apiKey.trim()) {
    console.log('❌ API Key is required!');
    rl.close();
    return;
  }

  if (!senderId.trim()) {
    console.log('❌ Sender ID is required!');
    rl.close();
    return;
  }

  // Create environment variables
  const envContent = `# Message Central Configuration
MESSAGE_CENTRAL_API_KEY=${apiKey}
MESSAGE_CENTRAL_SENDER_ID=${senderId}
MESSAGE_CENTRAL_BASE_URL=${baseUrl}${templateId ? `\nMESSAGE_CENTRAL_TEMPLATE_ID=${templateId}` : ''}

# Database Configuration (if not already set)
MONGODB_URI=mongodb://localhost:27017/shivangi-battery

# JWT Configuration (if not already set)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
`;

  // Write to .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Configuration saved to .env.local');
  console.log('\n📋 Next Steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test the integration: node scripts/test-message-central.mjs');
  console.log('3. Check admin dashboard: http://localhost:3000/admin/message-central');
  console.log('4. Send a test OTP from your application');

  // Ask if user wants to test now
  const testNow = await question('\nWould you like to test the integration now? (y/n): ');
  
  if (testNow.toLowerCase() === 'y' || testNow.toLowerCase() === 'yes') {
    console.log('\n🧪 Testing Message Central Integration...');
    
    try {
      // Import and run test
      const { testMessageCentral } = await import('./test-message-central.mjs');
      await testMessageCentral();
    } catch (error) {
      console.log('❌ Test failed. Make sure your development server is running.');
      console.log('Error:', error.message);
    }
  }

  rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Configuration cancelled. You can run this script again anytime.');
  rl.close();
  process.exit(0);
});

// Run configuration
configureMessageCentral().catch((error) => {
  console.error('❌ Configuration failed:', error.message);
  rl.close();
  process.exit(1);
}); 