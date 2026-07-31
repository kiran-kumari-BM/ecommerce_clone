import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";

function ProductCard({ id, title, price, description, category, image }) {
  const dispatch = useDispatch();

  const addItemToCart = () => {
    const product = {
      id,
      title,
      price,
      description,
      category,
      image,
    };

    // Sending the product as an action to the REDUX store
    dispatch(addToCart(product));
  };

  return (
    <div className="relative flex flex-col m-5 bg-white z-30 p-10 shadow-sm rounded-md transition-transform duration-200 hover:scale-[1.02]">
      <p className="absolute top-2 right-2 text-xs italic text-gray-400">{category}</p>
      
      <div className="flex justify-center mb-4">
        <img src={image} className="object-contain h-48 w-48" alt={title} />
      </div>

      <h4 className="my-3 font-semibold line-clamp-1">{title}</h4>
      <p className="text-xs my-2 line-clamp-2 text-gray-500">{description}</p>
      
      <div className="mb-5 font-bold text-lg">${price.toFixed(2)}</div>

      <button 
        onClick={addItemToCart} 
        className="mt-auto p-2 text-xs md:text-sm bg-gradient-to-b from-yellow-200 to-yellow-400 border border-yellow-300 rounded-sm hover:from-yellow-300 hover:to-yellow-500 active:from-yellow-400 active:to-yellow-500 focus:outline-none cursor-pointer"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;