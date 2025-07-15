import axios from 'axios';

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_MOBILE = '9876543210'; // Replace with your test mobile number

async function testMessageCentral() {
  console.log('🧪 Testing Message Central Integration...\n');

  try {
    // Test 1: Send OTP
    console.log('1️⃣ Testing OTP sending...');
    const sendOtpResponse = await axios.post(`${BASE_URL}/auth/send-otp`, {
      mobile: TEST_MOBILE
    });

    if (sendOtpResponse.data.success) {
      console.log('✅ OTP sent successfully');
      console.log(`   Message: ${sendOtpResponse.data.message}`);
      console.log(`   Expires in: ${sendOtpResponse.data.expiresIn} seconds`);
    } else {
      console.log('❌ Failed to send OTP');
      console.log(`   Error: ${sendOtpResponse.data.message}`);
    }

    // Test 2: Test with invalid mobile number
    console.log('\n2️⃣ Testing invalid mobile number...');
    try {
      await axios.post(`${BASE_URL}/auth/send-otp`, {
        mobile: '1234567890'
      });
      console.log('❌ Should have failed with invalid mobile number');
    } catch (error) {
      if (error.response?.data?.message?.includes('Invalid mobile number')) {
        console.log('✅ Correctly rejected invalid mobile number');
      } else {
        console.log('❌ Unexpected error for invalid mobile number');
      }
    }

    // Test 3: Test missing mobile number
    console.log('\n3️⃣ Testing missing mobile number...');
    try {
      await axios.post(`${BASE_URL}/auth/send-otp`, {});
      console.log('❌ Should have failed with missing mobile number');
    } catch (error) {
      if (error.response?.data?.message?.includes('Mobile number is required')) {
        console.log('✅ Correctly rejected missing mobile number');
      } else {
        console.log('❌ Unexpected error for missing mobile number');
      }
    }

    // Test 4: Test rate limiting (if OTP was sent successfully)
    if (sendOtpResponse.data.success) {
      console.log('\n4️⃣ Testing rate limiting...');
      try {
        await axios.post(`${BASE_URL}/auth/send-otp`, {
          mobile: TEST_MOBILE
        });
        console.log('❌ Should have been rate limited');
      } catch (error) {
        if (error.response?.data?.message?.includes('Please wait')) {
          console.log('✅ Rate limiting working correctly');
        } else {
          console.log('❌ Unexpected error for rate limiting');
        }
      }
    }

    console.log('\n🎉 Message Central integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check your console for OTP (development mode)');
    console.log('   2. Test OTP verification with the generated OTP');
    console.log('   3. Check Message Central dashboard for delivery status');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testMessageCentral(); 