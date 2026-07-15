import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '../lib/supabaseClient';

const PRICE = '9.99'; // set your product's price here
const CURRENCY = 'USD';

export default function PayPalCheckout({ userId, onSuccess }) {
  return (
    <PayPalScriptProvider
      options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: CURRENCY }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: PRICE, currency_code: CURRENCY } }],
          })
        }
        onApprove={async (data, actions) => {
          const order = await actions.order.capture();

          await supabase.from('payments').insert({
            user_id: userId,
            paypal_order_id: order.id,
            amount: PRICE,
            currency: CURRENCY,
            status: order.status, // usually 'COMPLETED'
          });

          onSuccess?.(order);
        }}
        onError={(err) => {
          console.error('PayPal checkout error:', err);
        }}
      />
    </PayPalScriptProvider>
  );
}