import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const authenticate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // FastAPI's OAuth2 expects form-urlencoded data for login
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch("https://ecommerce-clone-b.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!response.ok) throw new Error("Invalid email or password");
        
        const data = await response.json();
        
        // Save the correct token key so Payment.jsx can find it
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userEmail", email);
        
        // This forces the app to redirect to the Home Page after login
        navigate("/"); 

      } else {
        // Signup expects standard JSON
        const response = await fetch("https://ecommerce-clone-b.onrender.com/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, phone_number: phone }),
        });

        if (!response.ok) throw new Error("Email already registered");
        
        // After successful signup, instantly log them in
        setIsLogin(true);
        setError("Account created! Please sign in.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-10">
      <Link to="/">
        <h1 className="text-3xl font-bold mb-5 cursor-pointer">dummy.zon</h1>
      </Link>

      <div className="w-96 border border-gray-300 p-8 rounded-md bg-white shadow-sm">
        <h2 className="text-2xl font-medium mb-4">
          {isLogin ? "Sign-In" : "Create Account"}
        </h2>

        {error && <p className={`text-sm mb-4 ${error.includes("created") ? "text-green-600" : "text-red-500"}`}>{error}</p>}

        <form onSubmit={authenticate} className="flex flex-col space-y-3">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-400 px-3 py-1 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              required
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col">
              <label className="text-sm font-bold mb-1">Mobile number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-400 px-3 py-1 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                placeholder="Optional"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-400 px-3 py-1 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 w-full p-2 mt-4 rounded-md border border-yellow-500 active:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {isLogin ? "Sign In" : "Continue"}
          </button>
        </form>

        <p className="text-xs mt-4 leading-5">
          By continuing, you agree to dummy.zon's Conditions of Use and Privacy Notice.
        </p>

        {isLogin && (
          <div className="mt-6 flex flex-col items-center">
            <div className="w-full border-t border-gray-300 relative mb-4">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
                New to dummy.zon?
              </span>
            </div>
            <button
              onClick={() => setIsLogin(false)}
              className="w-full p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm active:bg-gray-300"
            >
              Create your dummy.zon account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;