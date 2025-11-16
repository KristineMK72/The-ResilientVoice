import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-publishable-key'); // Replace with your Stripe publishable key

export default function Cart() {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') return JSON.parse(localStorage.getItem('cart') || '[]');
    return [];
  });

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    const { id } = await response.json();
    await stripe.redirectToCheckout({ sessionId: id });
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <main className="main">
      <section className="card cart-container">
        <h1 className="cart-title">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <span>{item.name} - ${item.price} x {item.quantity}</span>
                <button className="cart-remove-btn" onClick={() => removeFromCart(index)}>Remove</button>
              </div>
            ))}
            <p className="cart-total">Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</p>
            <button className="cart-checkout-btn" onClick={handleCheckout}>Checkout with Stripe</button>
          </>
        )}
      </section>
    </main>
  );
}
