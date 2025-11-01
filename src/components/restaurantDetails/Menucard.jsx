import React from "react";
import { PiPlusCircleBold, PiMinusCircleBold } from "react-icons/pi";

function Menucard({ item, onQuantityChange, quantity }) {
  const handleIncrease = () => {
    onQuantityChange(item, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(item, quantity - 1);
    }
  };

  return (
    <div className="w-[496px] max-sm:w-full sm:w-full h-[245px] bg-white rounded-2xl shadow-xl flex items-center justify-between px-4">
      <div className="flex-1 overflow-hidden">
        <h3 className="font-bold">{item.name}</h3>
        <h3 className="font-semibold mt-4 text-sm line-clamp-4">{item.description}</h3>
        <h5 className="mt-4 font-bold">₹ {item.price}</h5>
      </div>

      <div className="w-[180px] flex-shrink-0 ml-4 relative">
        <img
          src={item.images && item.images.length > 0 ? item.images[0] : ""}
          alt={item.name}
          className="rounded-2xl w-full h-[12em] object-cover"
        />

        <div
          className="absolute top-[112px] right-0 w-[88px] h-[81px] bg-white bg-opacity-90 text-black flex items-center justify-center"
          style={{
            borderTopLeftRadius: "45px",
            borderBottomRightRadius: "12px",
            opacity: ".9",
          }}
        >
          {quantity === 0 ? (
            <button onClick={handleIncrease} aria-label={`Add ${item.name}`}>
              <PiPlusCircleBold size={34} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleDecrease} aria-label={`Decrease ${item.name} quantity`}>
                <PiMinusCircleBold size={26} />
              </button>
              <span className="font-bold text-lg">{quantity}</span>
              <button onClick={handleIncrease} aria-label={`Increase ${item.name} quantity`}>
                <PiPlusCircleBold size={26} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Menucard;
