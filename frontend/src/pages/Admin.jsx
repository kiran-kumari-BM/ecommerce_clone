import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ title: "", price: "", description: "", category: "", image: "" });
  const navigate = useNavigate();

  // Helper: Get token from localStorage
  const getAuthHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  const fetchProducts = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };
  
  // SECURE THE ROUTE: Check admin status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // 1. If no token, kick them to login
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 2. Decode the JWT token to read the email (the 'sub' property)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // 3. If they are not the admin, kick them to the homepage
      if (payload.sub !== "kirankumarimanjunath@gmail.com") {
        alert("Access Denied: You do not have admin privileges.");
        navigate("/");
        return;
      }
    } catch (error) {
      // If the token is invalid or corrupted, kick them to login
      navigate("/login");
      return;
    }

    // 4. If they pass the security check, load the admin data!
    fetchProducts();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (res.ok) {
      alert("Product deleted!");
      fetchProducts();
    } else {
      alert("Error: You might not be authorized.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...formData, price: parseFloat(formData.price) })
    });

    if (res.ok) {
      alert("Product added!");
      setFormData({ title: "", price: "", description: "", category: "", image: "" });
      fetchProducts();
    } else {
      alert("Failed to add product.");
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="bg-gray-100 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="p-2 border" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <input className="p-2 border" placeholder="Price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <input className="p-2 border col-span-2" placeholder="Image URL" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required />
          <input className="p-2 border" placeholder="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          <textarea className="p-2 border col-span-2" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
        </div>
        <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Add Product</button>
      </form>

      {/* Product Table */}
      <table className="w-full text-left border-collapse">
        <thead><tr className="border-b"><th className="p-2">Title</th><th className="p-2">Price</th><th className="p-2">Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.title}</td>
              <td className="p-2">₹{p.price}</td>
              <td className="p-2">
                <button onClick={() => handleDelete(p.id)} className="text-red-600 font-bold">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;