import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 1. Check if the user is the admin
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // If the logged-in email is yours, make them an admin!
      if (payload.sub === "kirankumarimanjunath@gmail.com") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Could not read token");
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        dummy.zon
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        
        {/* 2. THE FIX: Now this only shows if isAdmin is true */}
        {isAdmin && (
          <button 
            onClick={() => navigate("/admin")}
            className="text-white font-bold hover:text-yellow-400"
          >
            Admin Dashboard
          </button>
        )}

        <button onClick={() => navigate("/orders")} className="hover:text-yellow-400">
          Returns & Orders
        </button>

        {token ? (
          <button onClick={handleSignOut} className="hover:text-yellow-400">
            Sign Out
          </button>
        ) : (
          <button onClick={() => navigate("/login")} className="hover:text-yellow-400">
            Login
          </button>
        )}

        <button onClick={() => navigate("/checkout")} className="hover:text-yellow-400">
          Cart
        </button>
      </div>
    </header>
  );
}

export default Header;