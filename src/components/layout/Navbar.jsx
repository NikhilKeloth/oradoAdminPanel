import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import axios from "axios";
import logo from "../../assets/oradoLogo.png";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "../../slices/locationSlice";
import { Link } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
function Navbar() {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const fetchSuggestions = async (searchText) => {
    if (!searchText) return;
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${searchText}&format=json&addressdetails=1`
    );
    setSuggestions(res.data);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (place) => {
    console.log(place)
    setSelectedLocation({
      name: place.display_name,
      lat: place.lat,
      lon: place.lon,
    });

    dispatch(setLocation({
  name: place.display_name,
  lat: place.lat,
  lon: place.lon,
}));
    setQuery(place.display_name);
    setSuggestions([]);
  };

return (
  <div className="w-full bg-white shadow-md fixed top-0 z-50">
    <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      {/* Logo & Name */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Orado Logo" className="h-10 w-auto" />
        <span className="text-2xl font-semibold text-gray-800">Orado</span>
      </div>

      {/* Location Autocomplete */}
      <div className="hidden md:flex items-center gap-2 relative w-80">
        <div className="flex items-center gap-2 border px-3 py-1 rounded-lg w-full">
          <FiMapPin size={18} className="text-[#EA4424]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Location"
            className="outline-none bg-transparent w-full"
          />
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute z-10 top-12 bg-white border w-full mt-1 max-h-48 overflow-auto shadow-md rounded-lg">
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                onClick={() => handleSelect(place)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
   
      {/* Desktop Nav */}
      <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
        <Link to="/">
          <li className="hover:text-[#EA4424] cursor-pointer">Home</li>
        </Link>
        <Link to="/restaurants">
          <li className="hover:text-[#EA4424] cursor-pointer">Restaurant</li>
        </Link>
        <Link to="/menu">
          <li className="hover:text-[#EA4424] cursor-pointer">Menu</li>
        </Link>
        <Link to="/blog">
          <li className="hover:text-[#EA4424] cursor-pointer">Blog</li>
        </Link>
        <Link to="/notifications">
          <li className="hover:text-[#EA4424] cursor-pointer">Notifications</li>
        </Link>
        <Link to="/contact">
          <li className="hover:text-[#EA4424] cursor-pointer">Contact</li>
        </Link>
        <Link to="/search">
          <li className="cursor-pointer">
            <FiSearch size={20} />
          </li>
        </Link>
        <Link to="/add-to-cart">
          <li className="cursor-pointer"> 
            <FiShoppingBag size={20} />
          </li>
        </Link>
        <Link to={user ? "/my-account" : "/login"}>
          <button className="flex items-center gap-4 text-black px-6 py-2 rounded-full font-bold hover:bg-[#d1381b] transition">
            <VscAccount size={25} />
            {user ? user.name : "Login"}
        
          </button>
        </Link>
      </ul>

      {/* Mobile Menu Icon */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </div>

    {/* Mobile Menu */}
    {menuOpen && (
      <div className="md:hidden px-6 pb-4">
        <ul className="flex flex-col gap-4 text-gray-700 font-medium">
          <Link to="/">
            <li className="hover:text-[#EA4424] cursor-pointer">Home</li>
          </Link>
          <Link to="/restaurants">
            <li className="hover:text-[#EA4424] cursor-pointer">Restaurant</li>
          </Link>
          <Link to="/menu">
            <li className="hover:text-[#EA4424] cursor-pointer">Menu</li>
          </Link>
          <Link to="/blog">
            <li className="hover:text-[#EA4424] cursor-pointer">Blog</li>
          </Link>
          <Link to="/notifications">
            <li className="hover:text-[#EA4424] cursor-pointer">Notifications</li>
          </Link>
          <Link to="/contact">
            <li className="hover:text-[#EA4424] cursor-pointer">Contact</li>
          </Link>
          <Link to="/search">
            <li className="cursor-pointer flex items-center gap-2">
              <FiSearch /> Search
            </li>
          </Link>
          <Link to="/add-to-cart">
            <li className="cursor-pointer flex items-center gap-2">
              <FiShoppingBag /> Cart
            </li>
          </Link>
          <Link to={user ? "/my-account" : "/login"}>
            <button className="bg-[#EA4424] text-white px-2 py-2 w-40 md:w-60 rounded-full font-bold hover:bg-[#d1381b] transition text-sm md:text-base">
              <div className="flex items-center justify-center gap-2">
                <VscAccount size={20} className="md:size-[25px]" />
                <span>{user ? user.name : "Login"}</span>
              </div>
            </button>
          </Link>
        </ul>
      </div>
    )}
  </div>
);
}

export default Navbar;
