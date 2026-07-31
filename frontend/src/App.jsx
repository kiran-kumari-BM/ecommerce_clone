import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductFeed from './components/ProductFeed';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders'; // 1. WE IMPORT THE ORDERS PAGE HERE
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Header />
        
        <Routes>
          <Route path="/" element={
            <main className="max-w-screen-2xl mx-auto mt-4 px-4 pb-10">
              <ProductFeed />
            </main>
          } />
          
          <Route path="/checkout" element={<Checkout />} />
          
          <Route path="/payment" element={<Payment />} />

          {/* 2. WE REGISTER THE ORDERS ROUTE HERE */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          
        </Routes>
        
      </div>


    </Router>
  );
}

export default App;