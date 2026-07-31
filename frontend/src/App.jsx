import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home'; 
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import Login from './pages/Login';
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin"; // New Admin page import

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        {/* Header stays at the top of every page */}
        <Header />
        
        <Routes>
          {/* Main Storefront */}
          <Route path="/" element={<Home />} />
          
          {/* Product & Detail Routes */}
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* User & Shopping Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;