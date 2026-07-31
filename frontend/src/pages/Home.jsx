import { useEffect, useState } from "react";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        const data = await response.json();
        
        // DEBUG: This will show you exactly what the API returned in the Console
        console.log("Products from API:", data); 
        
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      {/* If products is empty, this will be blank */}
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}

export default Home;