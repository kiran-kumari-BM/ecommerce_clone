import { useSelector } from "react-redux";
import { selectItems } from "../slices/cartSlice";
import CheckoutProduct from "../components/CheckoutProduct";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const items = useSelector(selectItems);
  const navigate = useNavigate();

  // Calculate total price
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    // 🚨 THIS IS THE FIX: We now route the user to the Razorpay page 
    // instead of calling the backend directly from this screen.
    navigate("/payment");
  };

  return (
    <div className="lg:flex max-w-screen-2xl mx-auto p-4 gap-4">
      
      {/* Left Side: Cart Items */}
      <div className="flex-grow m-2 shadow-sm">
        <div className="flex flex-col p-5 space-y-10 bg-white">
          <h1 className="text-3xl border-b pb-4 font-semibold">
            {items.length === 0 ? "Your dummy.zon Cart is empty." : "Shopping Cart"}
          </h1>

          {items.map((item, index) => (
            <CheckoutProduct
              key={index}
              id={item.id}
              title={item.title}
              price={item.price}
              description={item.description}
              category={item.category}
              image={item.image}
            />
          ))}
        </div>
      </div>

      {/* Right Side: Subtotal & Checkout Button */}
      {items.length > 0 && (
        <div className="flex flex-col bg-white p-6 shadow-md md:min-w-[300px] h-min mt-2">
          <h2 className="whitespace-nowrap font-medium text-lg">
            Subtotal ({items.length} items): 
            <span className="font-bold ml-2">${total.toFixed(2)}</span>
          </h2>

          <button 
            onClick={handleCheckout} 
            className="mt-4 p-2 w-full text-sm bg-gradient-to-b from-yellow-200 to-yellow-400 border border-yellow-300 rounded-sm hover:from-yellow-300 hover:to-yellow-500 active:from-yellow-400 active:to-yellow-500 focus:outline-none cursor-pointer"
          >
            Proceed to checkout
          </button>
        </div>
      )}
      
    </div>
  );
}

export default Checkout;