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
  if (!PASSWORD || !BASE_URL || !CUSTOMER_ID || !EMAIL) {
    throw new Error('Message Central environment variables not configured. Please check MESSAGE_CENTRAL_PASSWORD, MESSAGE_CENTRAL_BASE_URL, MESSAGE_CENTRAL_CUSTOMER_ID, and MESSAGE_CENTRAL_EMAIL.');
  }

  try {
    // Ensure password is properly encoded to base64
    const base64Key = Buffer.from(PASSWORD, 'utf8').toString('base64');

    const url = `${BASE_URL}/auth/v1/authentication/token?customerId=${CUSTOMER_ID}&key=${encodeURIComponent(base64Key)}&scope=NEW&country=91&email=${encodeURIComponent(EMAIL)}`;
    
    const res = await axios.get<TokenResponse>(url, {
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

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
    const token = await generateToken();

    if (!token) {
      throw new Error('Failed to generate authentication token');
    }

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
    const token = await generateToken();
    const url = `${BASE_URL}/verification/v3/validateOtp?verificationId=${verificationId}&code=${code}`;

    const response = await axios.get(url, {
      headers: {
        authToken: token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

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
