export {};

declare global {
  interface RemitaPaymentConfig {
    key: string;
    customerId: string;
    transactionId: number;
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    narration: string;
    onSuccess: (response: Record<string, unknown>) => void;
    onError: (response: Record<string, unknown>) => void;
    onClose: () => void;
  }

  interface RemitaPaymentHandler {
    showPaymentWidget: () => void;
  }

  interface Window {
    RmPaymentEngine?: {
      init: (config: RemitaPaymentConfig) => RemitaPaymentHandler;
    };
  }
}
