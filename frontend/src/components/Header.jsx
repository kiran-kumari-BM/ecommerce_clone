import { useSelector } from "react-redux";
import { selectItems } from "../slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const items = useSelector(selectItems);
  const navigate = useNavigate();
  
  // Check if a user is logged in by looking in local storage
  const userEmail = localStorage.getItem("userEmail");

  const handleAuthentication = () => {
    if (userEmail) {
      // Log out
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      window.location.reload(); // Refresh to reset state
    } else {
      // Go to log in
      navigate("/login");
    }
  };

  return (
    <header className="bg-amazon_blue flex items-center p-2 flex-grow sm:flex-grow-0">
      
      {/* Logo Area */}
      <Link to="/">
        <div className="mt-2 flex items-center flex-grow sm:flex-grow-0 px-4 cursor-pointer">
          <h1 className="text-white font-bold text-2xl">dummy.zon</h1>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="hidden sm:flex bg-yellow-400 hover:bg-yellow-500 items-center h-10 rounded-md flex-grow cursor-pointer transition-colors duration-200 ml-2">
        <input 
          type="text" 
          className="p-2 h-full w-6 flex-grow flex-shrink rounded-l-md focus:outline-none px-4 text-black" 
          placeholder="Search products..."
        />
        <div className="p-4 font-bold text-gray-800">Q</div>
      </div>

      {/* Right Side Icons/Links */}
      <div className="text-white flex items-center text-xs space-x-6 mx-6 whitespace-nowrap">
        
        {/* Dynamic Login / Logout Button */}
        <div onClick={handleAuthentication} className="cursor-pointer hover:underline">
          <p>{userEmail ? `Hello, ${userEmail}` : "Hello, Sign in"}</p>
          <p className="font-extrabold md:text-sm">
            {userEmail ? "Sign Out" : "Account & Lists"}
          </p>
        </div>
        
        {/* Orders Link */}
        <Link to="/orders" className="cursor-pointer hover:underline">
          <p>Returns</p>
          <p className="font-extrabold md:text-sm">& Orders</p>
        </Link>

        {/* Cart */}
        <Link to="/checkout">
          <div className="cursor-pointer flex items-center hover:underline relative">
            <span className="text-3xl">🛒</span>
            <span className="absolute top-0 right-0 md:right-8 bg-yellow-400 text-black font-bold rounded-full h-4 w-4 text-center leading-4">
              {items.length}
            </span>
            <p className="hidden md:inline font-extrabold md:text-sm mt-2 ml-1">Cart</p>
          </div>
        </Link>

      </div>
    </header>
  );
}

export default Header;