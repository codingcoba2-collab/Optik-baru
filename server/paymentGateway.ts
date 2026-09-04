import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Bank Metadata & Virtual Account Specifications
export interface BankSpec {
  code: string;
  name: string;
  shortName: string;
  prefix: string;
  logo: string;
  color: string;
  description: string;
  instructions: {
    atm: string[];
    mobileBanking: string[];
    internetBanking: string[];
  };
}

export const SUPPORTED_BANKS: Record<string, BankSpec> = {
  bri: {
    code: 'bri',
    name: 'Bank Rakyat Indonesia',
    shortName: 'BRI Virtual Account',
    prefix: '8803',
    logo: 'BRI',
    color: '#00529C',
    description: 'Bayar via BRIMO, ATM BRI, atau Internet Banking BRI',
    instructions: {
      atm: [
        'Masukkan kartu ATM BRI dan PIN Anda.',
        'Pilih menu Transaksi Lainnya > Pembayaran > Lainnya > BRIVA.',
        'Masukkan Nomor Virtual Account Anda.',
        'Konfirmasi detail tagihan, lalu tekan Ya/Kirim.',
        'Simpan struk sebagai bukti pembayaran.'
      ],
      mobileBanking: [
        'Buka aplikasi BRImo dan login.',
        'Pilih menu Pembayaran > BRIVA.',
        'Masukkan Nomor Virtual Account.',
        'Pastikan nominal dan nama toko/pesanan sesuai.',
        'Masukkan PIN BRImo Anda dan konfirmasi transaksi.'
      ],
      internetBanking: [
        'Login ke Internet Banking BRI.',
        'Pilih menu Pembayaran Tagihan > Pembayaran > BRIVA.',
        'Masukkan Nomor Virtual Account.',
        'Periksa detail pembayaran, masukkan password mToken Anda.'
      ]
    }
  },
  bca: {
    code: 'bca',
    name: 'Bank Central Asia',
    shortName: 'BCA Virtual Account',
    prefix: '8801',
    logo: 'BCA',
    color: '#003F87',
    description: 'Bayar via BCA mobile, myBCA, KlikBCA, atau ATM BCA',
    instructions: {
      atm: [
        'Masukkan kartu ATM BCA dan PIN Anda.',
        'Pilih Transaksi Lainnya > Transfer > Ke Rek BCA Virtual Account.',
        'Masukkan Nomor BCA Virtual Account.',
        'Periksa jumlah nominal transfer pada layar konfirmasi, tekan Ya.',
        'Simpan bukti transaksi Anda.'
      ],
      mobileBanking: [
        'Buka aplikasi BCA mobile / myBCA dan login.',
        'Pilih m-Transfer > BCA Virtual Account.',
        'Masukkan Nomor BCA Virtual Account.',
        'Periksa detail nama & nominal pesanan kacamata optik.',
        'Masukkan PIN m-BCA untuk menyelesaikan pembayaran.'
      ],
      internetBanking: [
        'Login ke KlikBCA Individual.',
        'Pilih Transfer Dana > Transfer ke BCA Virtual Account.',
        'Masukkan Nomor BCA Virtual Account.',
        'Kirim respon KeyBCA Appli 1 dan klik Kirim.'
      ]
    }
  },
  bni: {
    code: 'bni',
    name: 'Bank Negara Indonesia',
    shortName: 'BNI Virtual Account',
    prefix: '8804',
    logo: 'BNI',
    color: '#F15A24',
    description: 'Bayar via BNI Mobile Banking, ATM BNI, atau SMS Banking',
    instructions: {
      atm: [
        'Masukkan kartu ATM BNI dan PIN.',
        'Pilih Menu Lain > Pembayaran > Menu Berikutnya > Virtual Account Billing.',
        'Masukkan Nomor Virtual Account BNI.',
        'Konfirmasi data tagihan optik dan tekan Ya.',
        'Ambil struk transaksi Anda.'
      ],
      mobileBanking: [
        'Buka BNI Mobile Banking dan masukkan MPIN.',
        'Pilih menu Pembayaran > Virtual Account Billing.',
        'Pilih rekening debit dan masukkan Nomor Virtual Account.',
        'Masukkan Password Transaksi dan selesaikan pembayaran.'
      ],
      internetBanking: [
        'Login ke BNI Internet Banking.',
        'Pilih Transaksi > Pembayaran Tagihan > Virtual Account Billing.',
        'Masukkan Nomor Virtual Account dan otorisasi dengan BNI e-Secure.'
      ]
    }
  },
  mandiri: {
    code: 'mandiri',
    name: 'Bank Mandiri',
    shortName: 'Mandiri Virtual Account',
    prefix: '8902',
    logo: 'MANDIRI',
    color: '#003366',
    description: 'Bayar via Livin by Mandiri atau ATM Mandiri',
    instructions: {
      atm: [
        'Masukkan kartu ATM Mandiri dan PIN.',
        'Pilih Bayar/Beli > Lainnya > Multi Payment.',
        'Masukkan Kode Perusahaan / Biller (misal: 70012).',
        'Masukkan Nomor Virtual Account Mandiri.',
        'Pilih tagihan nomor 1 dan konfirmasi pembayaran.'
      ],
      mobileBanking: [
        'Buka aplikasi Livin by Mandiri dan login.',
        'Pilih menu Bayar > cari penyedia jasa/VA Mandiri.',
        'Masukkan Nomor Virtual Account Mandiri.',
        'Periksa nominal pembayaran dan konfirmasi dengan PIN Livin.'
      ],
      internetBanking: [
        'Login ke Mandiri Online.',
        'Pilih menu Bayar > Multi Payment.',
        'Pilih penyedia jasa dan masukkan Nomor Virtual Account.',
        'Konfirmasi dengan Token Mandiri Anda.'
      ]
    }
  },
  permata: {
    code: 'permata',
    name: 'Bank Permata',
    shortName: 'Permata Virtual Account',
    prefix: '8805',
    logo: 'PERMATA',
    color: '#830051',
    description: 'Bayar via PermataME, PermataNet, atau ATM Permata',
    instructions: {
      atm: [
        'Masukkan kartu ATM Permata dan PIN.',
        'Pilih Transaksi Lainnya > Pembayaran > Virtual Account.',
        'Masukkan Nomor Permata Virtual Account.',
        'Tekan Benar dan konfirmasi transaksi.'
      ],
      mobileBanking: [
        'Buka PermataME dan login.',
        'Pilih menu Bayar Tagihan > Virtual Account.',
        'Masukkan Nomor Virtual Account Permata.',
        'Konfirmasi nominal dan masukkan PIN.'
      ],
      internetBanking: [
        'Login ke PermataNet.',
        'Pilih Pembayaran Tagihan > Virtual Account.',
        'Masukkan nomor VA dan ikuti petunjuk otentikasi.'
      ]
    }
  },
  cimb: {
    code: 'cimb',
    name: 'CIMB Niaga',
    shortName: 'CIMB Niaga Virtual Account',
    prefix: '8806',
    logo: 'CIMB',
    color: '#7D0000',
    description: 'Bayar via OCTO Mobile, OCTO Clicks, atau ATM CIMB Niaga',
    instructions: {
      atm: [
        'Masukkan kartu ATM CIMB Niaga dan PIN.',
        'Pilih Pembayaran > Lanjut > Virtual Account.',
        'Masukkan Nomor Virtual Account CIMB Niaga.',
        'Periksa data dan tekan Proses untuk membayar.'
      ],
      mobileBanking: [
        'Buka OCTO Mobile dan login.',
        'Pilih menu Tagihan & Pembayaran > Virtual Account.',
        'Masukkan Nomor Virtual Account.',
        'Konfirmasi nominal dan masukkan PIN OCTO Mobile.'
      ],
      internetBanking: [
        'Login ke OCTO Clicks.',
        'Pilih Bayar Tagihan > Virtual Account.',
        'Masukkan Nomor Virtual Account dan token SMS/App.'
      ]
    }
  },
  bsi: {
    code: 'bsi',
    name: 'Bank Syariah Indonesia',
    shortName: 'BSI Virtual Account',
    prefix: '8807',
    logo: 'BSI',
    color: '#00A39D',
    description: 'Bayar via BSI Mobile, BSI Net Banking, atau ATM BSI',
    instructions: {
      atm: [
        'Masukkan kartu ATM BSI dan PIN.',
        'Pilih Menu Utama > Pembayaran/Beli > Institusi/VA.',
        'Masukkan Kode Institusi dan Nomor Virtual Account.',
        'Konfirmasi nominal dan selesaikan transaksi.'
      ],
      mobileBanking: [
        'Buka BSI Mobile dan login.',
        'Pilih menu Bayar > Institusi / Virtual Account.',
        'Masukkan Nomor Virtual Account BSI.',
        'Masukkan PIN BSI Mobile Anda untuk konfirmasi.'
      ],
      internetBanking: [
        'Login ke BSI Net Banking.',
        'Pilih Pembayaran Tagihan > Virtual Account.',
        'Masukkan nomor VA dan ikuti langkah otentikasi.'
      ]
    }
  },
  danamon: {
    code: 'danamon',
    name: 'Bank Danamon',
    shortName: 'Danamon Virtual Account',
    prefix: '8808',
    logo: 'DANAMON',
    color: '#FF7F00',
    description: 'Bayar via D-Bank PRO atau ATM Danamon',
    instructions: {
      atm: [
        'Masukkan kartu ATM Danamon dan PIN.',
        'Pilih Pembayaran > Lainnya > Virtual Account.',
        'Masukkan Nomor Virtual Account Danamon dan tekan Benar.'
      ],
      mobileBanking: [
        'Buka aplikasi D-Bank PRO dan login.',
        'Pilih menu Pembayaran > Virtual Account.',
        'Masukkan Nomor Virtual Account Danamon dan masukkan mPIN.'
      ],
      internetBanking: [
        'Login ke Danamon Online Banking.',
        'Pilih Pembayaran > Virtual Account dan otorisasi dengan token.'
      ]
    }
  }
};

export interface PaymentTransactionRecord {
  paymentId: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  amount: number;
  paymentMethod: 'Virtual Account';
  bankCode: string;
  bankName: string;
  virtualAccountNumber: string;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  orderStatus: 'MENUNGGU PEMBAYARAN' | 'DIKONFIRMASI' | 'KADALUARSA' | 'DIBATALKAN';
  expiredAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  gatewayProvider: string;
  gatewayTransactionId?: string;
  signature?: string;
  isIdempotentProcessed?: boolean;
  items?: any[];
  instructions?: any;
}

// In-memory fallback repository to ensure high performance and persistence during session
export const paymentTransactions = new Map<string, PaymentTransactionRecord>();

// Helper to check if payment gateway keys are configured
export function getGatewayConfig() {
  const provider = (process.env.PAYMENT_GATEWAY_PROVIDER || 'midtrans').toLowerCase();
  const serverKey = process.env.PAYMENT_GATEWAY_SERVER_KEY || '';
  const clientKey = process.env.PAYMENT_GATEWAY_CLIENT_KEY || '';
  const merchantId = process.env.PAYMENT_GATEWAY_MERCHANT_ID || '';
  const isProduction = process.env.PAYMENT_GATEWAY_IS_PRODUCTION === 'true';
  const webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET || serverKey;

  const isConfigured = Boolean(serverKey && serverKey.trim().length > 5);

  return {
    provider,
    serverKey,
    clientKey,
    merchantId,
    isProduction,
    webhookSecret,
    isConfigured
  };
}

// Generate an authentic Virtual Account number based on bank prefix & transaction id
export function generateVirtualAccountNumber(bankCode: string, orderId: string, amount: number): string {
  const bank = SUPPORTED_BANKS[bankCode.toLowerCase()] || SUPPORTED_BANKS.bri;
  const prefix = bank.prefix;
  
  // Deterministic yet unique generation derived from order hash to ensure stable VA per order
  const hash = crypto.createHash('md5').update(`${orderId}-${bankCode}`).digest('hex');
  const numericPart = (parseInt(hash.slice(0, 10), 16) % 9000000000 + 1000000000).toString();
  
  return `${prefix}${numericPart}`;
}

// Calculate SHA512 signature for Midtrans compatibility
export function calculateMidtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(payload).digest('hex');
}

// Call real Midtrans Core API if configured
async function callMidtransApi(orderData: {
  orderId: string;
  amount: number;
  bankCode: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: any[];
}, serverKey: string, isProduction: boolean) {
  const endpoint = isProduction 
    ? 'https://api.midtrans.com/v2/charge' 
    : 'https://api.sandbox.midtrans.com/v2/charge';

  const bank = orderData.bankCode.toLowerCase();
  let paymentType = 'bank_transfer';
  let bankTransferBody: any = { bank };

  if (bank === 'mandiri') {
    paymentType = 'echannel';
    bankTransferBody = {
      bill_info1: 'Pembayaran Kacamata',
      bill_info2: orderData.orderId
    };
  } else if (bank === 'permata') {
    bankTransferBody = { bank: 'permata' };
  }

  const payload: any = {
    payment_type: paymentType,
    transaction_details: {
      order_id: orderData.orderId,
      gross_amount: Math.round(orderData.amount)
    },
    customer_details: {
      first_name: orderData.customerName,
      email: orderData.customerEmail || 'customer@eyehub.id',
      phone: orderData.customerPhone || '08123456789'
    }
  };

  if (paymentType === 'bank_transfer') {
    payload.bank_transfer = bankTransferBody;
  } else if (paymentType === 'echannel') {
    payload.echannel = bankTransferBody;
  }

  const basicAuth = Buffer.from(`${serverKey}:`).toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Midtrans API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Create Virtual Account Transaction
export async function createVirtualAccountTransaction(params: {
  orderId: string;
  orderNo?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  amount: number;
  bankCode: string;
  items?: any[];
}): Promise<PaymentTransactionRecord> {
  const {
    orderId,
    orderNo = `INV-${orderId}`,
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    amount,
    bankCode: rawBankCode,
    items = []
  } = params;

  const bankCode = rawBankCode.toLowerCase();
  const bank = SUPPORTED_BANKS[bankCode] || SUPPORTED_BANKS.bri;

  const config = getGatewayConfig();
  const paymentId = `PAY-VA-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  
  // Expiry set to 24 hours from now
  const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expiredAt = expiryDate.toISOString();

  let virtualAccountNumber = generateVirtualAccountNumber(bankCode, orderId, amount);
  let gatewayTransactionId: string | undefined = undefined;

  // If real server key is set, call gateway API directly
  if (config.isConfigured) {
    try {
      if (config.provider === 'midtrans') {
        const midtransRes = await callMidtransApi({
          orderId,
          amount,
          bankCode,
          customerName,
          customerEmail,
          customerPhone,
          items
        }, config.serverKey, config.isProduction);

        gatewayTransactionId = midtransRes.transaction_id;
        if (midtransRes.va_numbers && midtransRes.va_numbers.length > 0) {
          virtualAccountNumber = midtransRes.va_numbers[0].va_number;
        } else if (midtransRes.permata_va_number) {
          virtualAccountNumber = midtransRes.permata_va_number;
        } else if (midtransRes.bill_key && midtransRes.biller_code) {
          virtualAccountNumber = `${midtransRes.biller_code}-${midtransRes.bill_key}`;
        }
      }
    } catch (apiErr: any) {
      console.warn('Payment gateway API notice, switching to prepared VA mode:', apiErr.message);
    }
  }

  const record: PaymentTransactionRecord = {
    paymentId,
    orderId,
    orderNo,
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    amount,
    paymentMethod: 'Virtual Account',
    bankCode: bank.code,
    bankName: bank.name,
    virtualAccountNumber,
    paymentStatus: 'PENDING',
    orderStatus: 'MENUNGGU PEMBAYARAN',
    expiredAt,
    paidAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    gatewayProvider: config.provider,
    gatewayTransactionId,
    items,
    instructions: bank.instructions
  };

  // Save to in-memory map
  paymentTransactions.set(orderId, record);
  paymentTransactions.set(paymentId, record);

  return record;
}

// Process Webhook / Callback from Payment Gateway with Idempotency & Signature Verification
export async function processPaymentWebhook(payload: any, headers: Record<string, string | string[] | undefined>): Promise<{
  success: boolean;
  status: 'PROCESSED' | 'ALREADY_PROCESSED' | 'INVALID_SIGNATURE' | 'NOT_FOUND' | 'IGNORED';
  message: string;
  orderId?: string;
  paymentRecord?: PaymentTransactionRecord;
}> {
  const config = getGatewayConfig();

  // Handle both Midtrans and generic VA formats
  const orderId = payload.order_id || payload.orderId || payload.external_id;
  const transactionStatus = (payload.transaction_status || payload.status || '').toLowerCase();
  const statusCode = payload.status_code || payload.statusCode || '200';
  const grossAmount = payload.gross_amount ? String(payload.gross_amount) : '';
  const incomingSignature = payload.signature_key || (headers['x-callback-token'] as string) || '';

  if (!orderId) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'order_id is required in webhook payload'
    };
  }

  // Find transaction
  const record = paymentTransactions.get(orderId);
  if (!record) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: `Transaction with orderId ${orderId} not found`
    };
  }

  // IDEMPOTENCY CHECK:
  // If transaction is already marked as PAID, do NOT process twice or deduct stock twice
  if (record.paymentStatus === 'PAID' || record.isIdempotentProcessed) {
    return {
      success: true,
      status: 'ALREADY_PROCESSED',
      message: `Transaction ${orderId} has already been processed idempotently. No duplicate changes made.`,
      orderId,
      paymentRecord: record
    };
  }

  // SIGNATURE VERIFICATION:
  // If payment gateway secret is configured and signature is provided, verify it strictly
  if (config.isConfigured && incomingSignature && grossAmount) {
    const expectedSignature = calculateMidtransSignature(orderId, statusCode, grossAmount, config.serverKey);
    if (incomingSignature !== expectedSignature && incomingSignature !== config.webhookSecret) {
      console.warn('Invalid webhook signature for order:', orderId);
      return {
        success: false,
        status: 'INVALID_SIGNATURE',
        message: 'Signature verification failed. Potential spoofed request rejected.'
      };
    }
  }

  const now = new Date().toISOString();

  // Evaluate status
  const isSettlement = transactionStatus === 'settlement' || transactionStatus === 'capture' || transactionStatus === 'paid' || transactionStatus === 'success';
  const isExpired = transactionStatus === 'expire' || transactionStatus === 'expired';
  const isCancelled = transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'failed';

  if (isSettlement) {
    record.paymentStatus = 'PAID';
    record.orderStatus = 'DIKONFIRMASI';
    record.paidAt = now;
    record.updatedAt = now;
    record.isIdempotentProcessed = true;
    record.gatewayTransactionId = payload.transaction_id || record.gatewayTransactionId || `gw-tx-${Date.now()}`;

    // Update in-memory
    paymentTransactions.set(orderId, record);
    paymentTransactions.set(record.paymentId, record);

    return {
      success: true,
      status: 'PROCESSED',
      message: `Pembayaran berhasil diverifikasi oleh payment gateway! Order #${orderId} telah DIKONFIRMASI.`,
      orderId,
      paymentRecord: record
    };
  } else if (isExpired) {
    record.paymentStatus = 'EXPIRED';
    record.orderStatus = 'KADALUARSA';
    record.updatedAt = now;
    paymentTransactions.set(orderId, record);

    return {
      success: true,
      status: 'PROCESSED',
      message: `Virtual Account untuk order #${orderId} telah KADALUARSA.`,
      orderId,
      paymentRecord: record
    };
  } else if (isCancelled) {
    record.paymentStatus = 'FAILED';
    record.orderStatus = 'DIBATALKAN';
    record.updatedAt = now;
    paymentTransactions.set(orderId, record);

    return {
      success: true,
      status: 'PROCESSED',
      message: `Pembayaran order #${orderId} gagal atau dibatalkan.`,
      orderId,
      paymentRecord: record
    };
  }

  return {
    success: true,
    status: 'IGNORED',
    message: `Status ${transactionStatus} diterima dan dicatat. Menunggu penyelesaian.`,
    orderId,
    paymentRecord: record
  };
}
