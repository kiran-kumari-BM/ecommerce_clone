import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // If there's no token, don't bother the backend
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/orders", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        // SUCCESS: Logic is now fixed
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          // ERROR: Handle 401 or other errors
          console.error("Failed to fetch orders:", response.status);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-10">
      <h1 className="text-3xl border-b mb-2 pb-1 border-yellow-400 font-semibold">
        Your Orders
      </h1>

      {loading ? (
        <p className="mt-4">Loading your receipts...</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-lg">You haven't placed any orders yet.</p>
      ) : (
        <div className="mt-5 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="relative border rounded-md p-5 shadow-sm bg-white">
              {/* Top Banner of the Order Card */}
              <div className="flex items-center gap-x-10 p-5 bg-gray-100 text-sm text-gray-600 rounded-t-md -mx-5 -mt-5 mb-5 border-b">
                <div>
                  <p className="font-bold text-xs">ORDER PLACED</p>
                  <p>Order #{order.id}</p>
                </div>
                <div>
                  <p className="font-bold text-xs">TOTAL</p>
                  <p>₹{order.total_amount ? order.total_amount.toFixed(2) : "0.00"}</p>
                </div>
                <div className="flex-1 text-right whitespace-nowrap">
                  <p className="text-sm sm:text-base font-medium text-blue-500">
                    Paid via Razorpay
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-2 sm:p-5">
                <p className="text-sm font-bold truncate">
                  Includes {order.items ? order.items.length : 0} item(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <Link to="/" className="text-blue-500 hover:underline">
          &larr; Back to Shopping
        </Link>
      </div>
    </div>
  );
}

export default Orders;