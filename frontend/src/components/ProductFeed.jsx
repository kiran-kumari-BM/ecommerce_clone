import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

function ProductFeed() {
  // 1. Create a state variable to hold the products coming from Python
  const [products, setProducts] = useState([]);

  // 2. Use useEffect to run the fetch code exactly once when the page loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Hitting your local Ffetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`)
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const data = await response.json();
        
        // Storing the JSON data into our state
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products from backend:", error);
      }
    };

    fetchProducts();
  }, []); // The empty array ensures this only fires once on mount

  return (
    <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto">
      
      {/* 3. Map over the dynamically fetched state instead of the hardcoded array */}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          description={product.description}
          category={product.category}
          image={product.image}
        />
      ))}

    </div>
  );
}

export default ProductFeed;