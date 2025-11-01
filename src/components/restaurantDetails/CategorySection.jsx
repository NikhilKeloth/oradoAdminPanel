import React, { useEffect, useState } from "react";
import Menucard from "./Menucard";
import { updateCart, getCart } from "../../apis/cartApi";
import { useDispatch, useSelector } from "react-redux";
import { setCartId } from "../../slices/cartSlice";

function CategorySection({ category, restaurantId }) {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState({});
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) return;

    const fetchCart = async () => {
      try {
        const res = await getCart();
        console.log("getCart response:", res);

        // Use optional chaining in case res or products is undefined
        // Adjust this depending on what your getCart returns
        const cartData = res?.data?.products || res?.products || [];

        const cartMap = {};
        cartData.forEach((item) => {
          cartMap[item.productId] = item.quantity;
        });

        setCartItems(cartMap);

        // Optionally set cartId in Redux store if available
        if (res?._id) {
          dispatch(setCartId(res._id));
        }
      } catch (error) {
        console.error("Failed to fetch cart", error);
      }
    };

    fetchCart();
  }, [user, dispatch]);

  const handleAddCart = async (item, quantity) => {
    try {
      const userId = user._id;

      setCartItems((prev) => ({
        ...prev,
        [item._id]: quantity,
      }));

      await updateCart(restaurantId, userId, item._id, quantity);

      // Assuming you have addOrUpdateItem action imported; if not, remove this line
      // dispatch(addOrUpdateItem({ product: item, quantity }));
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  };

  return (
    <div className="my-8 w-full flex flex-col px-4 sm:px-6 md:px-10 lg:px-20">
      <h2 className="text-2xl font-bold mb-2 text-left">{category.categoryName}</h2>
      <p className="text-gray-600 mb-4 text-left">{category.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.length > 0 ? (
          category.items.map((item) => (
            <Menucard
              key={item._id}
              item={item}
              onQuantityChange={handleAddCart}
              quantity={cartItems[item._id] || 0}
            />
          ))
        ) : (
          <p className="text-gray-500">No items available in this category yet.</p>
        )}
      </div>
    </div>
  );
}

export default CategorySection;
