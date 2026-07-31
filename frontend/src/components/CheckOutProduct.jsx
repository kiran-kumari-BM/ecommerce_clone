import { useDispatch } from "react-redux";
import { removeFromCart } from "../slices/cartSlice";

function CheckoutProduct({ id, title, price, description, category, image }) {
  const dispatch = useDispatch();

  const removeItemFromCart = () => {
    // Send the ID to Redux to remove it from the array
    dispatch(removeFromCart({ id }));
  };

  return (
    <div className="grid grid-cols-5 border-b pb-4">
      
      {/* Left: Image */}
      <img src={image} className="object-contain h-44 w-44 col-span-1" alt={title} />

      {/* Middle: Details */}
      <div className="col-span-3 mx-5">
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-xs my-2 text-gray-500 line-clamp-3">{description}</p>
        <p className="font-bold text-lg mt-2">${price.toFixed(2)}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col space-y-2 my-auto justify-self-end col-span-1">
        <button 
          onClick={removeItemFromCart} 
          className="p-2 text-xs md:text-sm bg-gray-200 border border-gray-300 rounded-sm hover:bg-gray-300 active:bg-gray-400 focus:outline-none cursor-pointer"
        >
          Remove from Cart
        </button>
      </div>
      
    </div>
  );
}

export default CheckoutProduct;