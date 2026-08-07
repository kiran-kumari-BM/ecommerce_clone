import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";

function ProductDetail() {
  const { id } = useParams(); // Grabs the :id from the URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://ecommerce-clone-b.onrender.com/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!product) return <div className="p-20 text-center">Product not found!</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-10">
      <button onClick={() => navigate(-1)} className="mb-5 text-blue-600 hover:underline">
        ← Back to shopping
      </button>

      <div className="max-w-screen-lg mx-auto bg-white p-8 shadow-md rounded-lg grid md:grid-cols-2 gap-10">
        <img src={product.image} alt={product.title} className="w-full h-96 object-contain" />
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-500 mb-4 capitalize">{product.category}</p>
          <div className="text-3xl font-bold mb-6">₹{product.price.toFixed(2)}</div>
          
          <h3 className="font-semibold mb-2">About this item</h3>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <button 
            onClick={() => dispatch(addToCart(product))}
            className="w-full bg-yellow-400 hover:bg-yellow-500 p-4 rounded-md font-bold text-lg border border-yellow-500 shadow-sm transition-all"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;