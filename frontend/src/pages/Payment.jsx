import { useSelector, useDispatch } from "react-redux";
import { selectItems, clearCart } from "../slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRazorpay } from "react-razorpay";

function Payment() {
  const items = useSelector(selectItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();
  
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState("");

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAddress(`Lat: ${latitude}, Long: ${longitude}`);
        },
        (error) => alert("Unable to retrieve location")
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const openInMaps = () => {
    if (address.startsWith("Lat:")) {
        const coords = address.replace("Lat: ", "").replace("Long: ", "").split(", ");
        const url = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
        window.open(url, "_blank");
    } else {
        alert("Please fetch location first!");
    }
  };

  const handleRazorpayPayment = async () => {
    // 1. SAFETY CHECK: This prevents the 401 Database Error!
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to place an order.");
      navigate("/login"); 
      return; 
    }

    if (!address) {
      alert("Please enter or fetch your delivery address.");
      return;
    }

    setProcessing(true);
    
    const checkoutData = {
      items: items.map(item => ({ id: item.id, price: item.price })),
      total_amount: total,
      address: address
    };

    try {
      const orderResponse = await fetch("http://localhost:8000/api/razorpay/create_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData), 
      });
      
      if (!orderResponse.ok) {
         const errorData = await orderResponse.json();
         console.error("Failed to create order on backend:", errorData);
         alert("Could not initialize payment. Check console.");
         setProcessing(false);
         return;
      }

      const orderData = await orderResponse.json();

      const options = {
        key: "rzp_test_TJll7YzssBvYZ6",
        amount: Math.round(total * 100), 
        currency: "INR",
        name: "dummy.zon",
        description: "Secure Order",
        order_id: orderData.order_id, 
        handler: async function (response) {
          
          try {
            // Sending the confirmed token to the database
            const dbResponse = await fetch("http://localhost:8000/api/checkout", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
              },
              body: JSON.stringify(checkoutData),
            });

            const result = await dbResponse.json();

            if (dbResponse.ok) {
              dispatch(clearCart());
              navigate("/"); 
            } else {
              console.error("Backend returned error:", result);
              alert(`Database Error: ${result.detail || "Check console for details"}`);
            }
          } catch (err) {
            console.error("Network error saving to DB:", err);
            alert("Network error. Check console.");
          }
        },
        theme: { color: "#131921" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
      setProcessing(false);

    } catch (error) {
      console.error("Payment initialization failed:", error);
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white max-w-screen-md mx-auto mt-10 p-10 shadow-md flex flex-col items-center">
      <h1 className="text-3xl font-semibold border-b pb-4 mb-8 w-full text-center">Secure Checkout</h1>
      
      <div className="flex flex-col mb-6 w-full max-w-sm">
        <label className="font-bold text-sm mb-1">Delivery Address</label>
        <textarea 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
          className="border border-gray-400 p-2 rounded focus:outline-none focus:border-yellow-500"
          rows={3}
          required
        />
        <div className="flex gap-2">
            <button type="button" onClick={handleGetLocation} className="text-blue-500 text-sm mt-1 text-left hover:underline">
            📍 Use current location
            </button>
            <button type="button" onClick={openInMaps} className="text-gray-600 text-sm mt-1 text-left hover:underline">
            🗺️ View on Map
            </button>
        </div>
      </div>

      <h4 className="text-2xl font-medium mb-8">Order Total: ₹{total.toFixed(2)}</h4>

      <button 
        onClick={handleRazorpayPayment}
        disabled={processing || !address}
        className={`w-full max-w-sm p-4 text-lg font-bold rounded-md shadow-sm transition-all ${
          processing || !address
          ? "bg-gray-300 cursor-not-allowed" 
          : "bg-gradient-to-b from-yellow-200 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500"
        }`}
      >
        {processing ? "Processing..." : "Pay with Razorpay"}
      </button>
    </div>
  );
}

export default Payment;