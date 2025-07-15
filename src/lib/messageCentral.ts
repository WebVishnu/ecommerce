import axios from 'axios';

const BASE_URL = process.env.MESSAGE_CENTRAL_BASE_URL;
const CUSTOMER_ID = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
const EMAIL = process.env.MESSAGE_CENTRAL_EMAIL;
const PASSWORD = process.env.MESSAGE_CENTRAL_PASSWORD;



interface TokenResponse {
  status: number;
  token: string;
}

interface SendOtpResult {
  success: boolean;
  message: string;
  verificationId?: string;
}

interface ValidateOtpResult {
  success: boolean;
  message: string;
  verificationStatus?: string;
}

interface DeliveryStatusResult {
  success: boolean;
  status: string;
  message: string;
}

interface BalanceResult {
  success: boolean;
  balance?: number;
  message: string;
}

/**
 * 📱 Validate Mobile Number
 */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function isValidOtp(otp: string): boolean {
  return /^\d{4,6}$/.test(otp);
}

/**
 * 🔐 Generate Auth Token
 */
async function generateToken(): Promise<string> {
  console.log('🔍 Checking environment variables...');
  console.log('PASSWORD:', PASSWORD ? 'Set' : 'Missing');
  console.log('BASE_URL:', BASE_URL || 'Missing');
  console.log('CUSTOMER_ID:', CUSTOMER_ID || 'Missing');
  console.log('EMAIL:', EMAIL || 'Missing');
  
  if (!PASSWORD || !BASE_URL || !CUSTOMER_ID || !EMAIL) {
    throw new Error('Message Central environment variables not configured. Please check MESSAGE_CENTRAL_PASSWORD, MESSAGE_CENTRAL_BASE_URL, MESSAGE_CENTRAL_CUSTOMER_ID, and MESSAGE_CENTRAL_EMAIL.');
  }

  try {
    console.log('🔐 Creating base64 key...');
    // Ensure password is properly encoded to base64
    const base64Key = Buffer.from(PASSWORD, 'utf8').toString('base64');
    console.log('✅ Base64 key created:', base64Key.substring(0, 10) + '...');

    const url = `${BASE_URL}/auth/v1/authentication/token?customerId=${CUSTOMER_ID}&key=${encodeURIComponent(base64Key)}&scope=NEW&country=91&email=${encodeURIComponent(EMAIL)}`;
    console.log('🌐 Requesting token from:', url);
    
    const res = await axios.get<TokenResponse>(url, {
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    console.log('✅ Token response received:', res.status, res.data);
    return res.data.token;
  } catch (error) {
    console.error('❌ Token generation failed:', error);
    throw error;
  }
}

/**
 * 📲 Send OTP
 */
export async function sendOtp(mobileNumber: string): Promise<SendOtpResult> {
  try {
    console.log('🔐 Generating token...');
    const token = await generateToken();
    console.log('✅ Token generated:', token ? 'Success' : 'Failed');

    if (!token) {
      throw new Error('Failed to generate authentication token');
    }

    console.log('📤 Sending OTP request...');
    const response = await axios.post(
      `${BASE_URL}/verification/v3/send`,
      null,
      {
        params: {
          countryCode: '91',
          flowType: 'SMS',
          mobileNumber,
        },
        headers: {
          authToken: token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('✅ OTP sent successfully');
    return {
      success: true,
      message: 'OTP sent successfully',
      verificationId: response.data.data.verificationId,
    };
  } catch (err: unknown) {
    console.error('❌ Send OTP Error:', err);
    const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
      ? (err.response.data as { error?: string; message?: string })?.error || (err.response.data as { error?: string; message?: string })?.message
      : err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: errorMessage || 'Failed to send OTP',
    };
  }
}

/**
 * ✅ Validate OTP
 */
export async function validateOtp(
  verificationId: string,
  code: string
): Promise<ValidateOtpResult> {
  try {
    console.log('🔍 Validating OTP with verificationId:', verificationId);
    const token = await generateToken();
    const url = `${BASE_URL}/verification/v3/validateOtp?verificationId=${verificationId}&code=${code}`;

    console.log('🌐 Validating OTP at:', url);
    const response = await axios.get(url, {
      headers: {
        authToken: token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ OTP validation response:', response.status, response.data);

    // Handle different response structures
    let verificationStatus = 'unknown';
    if (response.data && response.data.data && response.data.data.verificationStatus) {
      verificationStatus = response.data.data.verificationStatus;
    } else if (response.data && response.data.verificationStatus) {
      verificationStatus = response.data.verificationStatus;
    } else if (response.data && response.data.status) {
      verificationStatus = response.data.status;
    }

    // Check if validation was successful
    const isSuccess = verificationStatus === 'SUCCESS' || 
                     verificationStatus === 'VERIFIED' || 
                     response.status === 200;

    return {
      success: isSuccess,
      message: isSuccess ? 'OTP validated successfully' : 'OTP validation failed',
      verificationStatus: verificationStatus,
    };
  } catch (err: unknown) {
    console.error('❌ Validate OTP Error:', err);
    const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
      ? (err.response.data as { error?: string; message?: string })?.error || (err.response.data as { error?: string; message?: string })?.message
      : err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: errorMessage || 'Failed to validate OTP',
    };
  }
}

/**
 * 📦 Check Delivery Status
 */
export async function checkDeliveryStatus(
  verificationId: string
): Promise<DeliveryStatusResult> {
  try {
    console.log('🔍 Checking delivery status for verificationId:', verificationId);
    const token = await generateToken();
    const url = `${BASE_URL}/verification/v3/validateOtp?verificationId=${verificationId}&code=dummy`;

    // This is a hack — delivery status is part of validation response in Message Central
    const response = await axios.get(url, {
      headers: {
        authToken: token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Delivery status response:', response.status, response.data);

    // Handle different response structures
    let status = 'unknown';
    if (response.data && response.data.data && response.data.data.verificationStatus) {
      status = response.data.data.verificationStatus;
    } else if (response.data && response.data.verificationStatus) {
      status = response.data.verificationStatus;
    } else if (response.data && response.data.status) {
      status = response.data.status;
    }

    return {
      success: true,
      status: status,
      message: 'Status checked successfully',
    };
  } catch (err: unknown) {
    console.error('❌ Delivery Status Error:', err);
    const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
      ? (err.response.data as { error?: string; message?: string })?.error || (err.response.data as { error?: string; message?: string })?.message
      : err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      status: 'error',
      message: errorMessage || 'Failed to check delivery status',
    };
  }
}

/**
 * 💰 Get Account Balance
 * NOTE: This was NOT clearly mentioned in the PDF docs, so this part is assumed.
 */
export async function getAccountBalance(): Promise<BalanceResult> {
  try {
    const token = await generateToken();
    const url = `${BASE_URL}/account/balance`;

    const response = await axios.get(url, {
      headers: {
        authToken: token,
      },
    });

    return {
      success: true,
      balance: response.data.balance,
      message: 'Balance fetched successfully',
    };
  } catch (err: unknown) {
    console.error('Balance Check Error:', err);
    const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
      ? (err.response.data as { error?: string; message?: string })?.error || (err.response.data as { error?: string; message?: string })?.message
      : err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: errorMessage || 'Failed to get account balance',
    };
  }
}
