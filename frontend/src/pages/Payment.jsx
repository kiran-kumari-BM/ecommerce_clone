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
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setFetchingLocation(true);
      setAddress("Finding your exact street..."); 

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Added zoom=18 for street-level accuracy and addressdetails=1 to get specific parts
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const { road, suburb, city, town, village, state, postcode } = data.address;
              
              // Build the custom address format
              const streetPart = road || suburb || "";
              const cityPart = city || town || village || "";
              
              // Filter out empty parts and join them with a comma
              const formattedParts = [streetPart, cityPart].filter(part => part !== "").join(", ");
              
              // Add state and PIN code exactly how you requested
              let finalAddress = formattedParts;
              if (state && postcode) {
                finalAddress += `, ${state} ${postcode}`;
              } else if (state) {
                finalAddress += `, ${state}`;
              }

              // Set it to the text box (fallback to default if custom format fails)
              setAddress(finalAddress || data.display_name);
            } else {
              setAddress(`Lat: ${latitude}, Long: ${longitude}`);
            }
          } catch (error) {
            console.error("Geocoding failed", error);
            setAddress(`Lat: ${latitude}, Long: ${longitude}`); 
          }
          setFetchingLocation(false);
        },
        (error) => {
          alert("Unable to retrieve location. Please type it manually.");
          setAddress("");
          setFetchingLocation(false);
        },
        // Force high accuracy if available (better for phones)
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const openInMaps = () => {
    if (address && !address.startsWith("Finding")) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, "_blank");
    } else {
        alert("Please enter or fetch an address first!");
    }
  };

  const handleRazorpayPayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to place an order.");
      navigate("/login"); 
      return; 
    }

    if (!address || address.startsWith("Finding")) {
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
          placeholder="Type your address or use current location"
          required
        />
        <div className="flex gap-4 mt-2">
            <button 
              type="button" 
              onClick={handleGetLocation} 
              disabled={fetchingLocation}
              className={`text-sm text-left hover:underline ${fetchingLocation ? "text-gray-400" : "text-blue-500"}`}
            >
              📍 {fetchingLocation ? "Locating..." : "Use current location"}
            </button>
            
            <button 
              type="button" 
              onClick={openInMaps} 
              className="text-gray-600 text-sm text-left hover:underline"
            >
              🗺️ Open in Maps
            </button>
        </div>
      </div>

      <h4 className="text-2xl font-medium mb-8">Order Total: ₹{total.toFixed(2)}</h4>

      <button 
        onClick={handleRazorpayPayment}
        disabled={processing || !address || address.startsWith("Finding")}
        className={`w-full max-w-sm p-4 text-lg font-bold rounded-md shadow-sm transition-all ${
          processing || !address || address.startsWith("Finding")
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