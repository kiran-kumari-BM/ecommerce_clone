import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice"; // Adjust path if needed
import { Link } from "react-router-dom"; // Import added

function Home() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      
      {/* --- STICKY HEADER: SEARCH + CATEGORY BAR --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto p-4 pb-0">
          <div className="relative flex items-center w-full h-10 rounded-md focus-within:ring-2 focus-within:ring-yellow-500 bg-yellow-400 overflow-hidden cursor-pointer">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 h-full w-full flex-grow flex-shrink outline-none px-4"
              placeholder="Search for products, brands, or keywords..."
            />
            <div className="h-10 w-12 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 transition-colors">
              <span className="text-xl">🔍</span>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto flex overflow-x-auto space-x-3 p-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              } border`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="max-w-screen-2xl mx-auto p-5">
        <p className="text-gray-500 text-sm mb-4">
          Showing {filteredProducts.length} results 
          {searchQuery && <span> for "<span className="font-semibold text-black">{searchQuery}</span>"</span>}
          {selectedCategory !== "All" && <span> in {selectedCategory}</span>}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white flex flex-col relative p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              
              <p className="absolute text-xs italic text-gray-400 right-4 top-4">{product.category}</p>
              
              {/* WRAPPER ADDED HERE */}
              <Link to={`/product/${product.id}`}>
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="h-48 w-full object-contain mb-4 cursor-pointer"
                />
                <h4 className="font-bold line-clamp-2 my-2 cursor-pointer hover:text-blue-600">
                  {product.title}
                </h4>
              </Link>
              
              <div className="mb-2">
                <span className="text-xl font-bold">₹{product.price.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-3 mb-5">
                {product.description}
              </p>
              
              <div className="mt-auto">
                <button 
                  onClick={() => dispatch(addToCart(product))}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md font-medium border border-yellow-500 shadow-sm transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No results found</h2>
            <p className="text-gray-500">Try checking your spelling or using more general terms.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-4 text-blue-500 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;