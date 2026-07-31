import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

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
        
        {/* Admin Dashboard Button (Only visible if logged in) */}
        {localStorage.getItem("token") && (
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

        {localStorage.getItem("token") ? (
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