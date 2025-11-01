import React from "react";
import Navbar from "../../components/layout/Navbar";
import deliveryBoy from "../../assets/deliveryBoy.png";

function Signup() {
  return (
    <div>
      <Navbar />

      <div className="mt-18">
        <div className="flex flex-1 flex-col md:flex-row h-screen">
          {/* Left side */}
          <div className="w-full md:w-1/2 flex flex-col px-4 py-6 md:px-10 md:py-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                New here?{" "}
                <span className="text-[#EA4424]">Create an account</span> <br />
                <span className="text-[#EA4424]">today</span>
              </h1>
              <h4 className="text-gray-500">
                Sign up and start ordering your favorite meals.
              </h4>
            </div>

            <div className="flex flex-col gap-5 mt-6">
              <input
                type="text"
                placeholder="Full Name"
                className="border border-gray-300 p-3 rounded outline-none w-full focus:border-l-4 focus:border-[#EA4424]"
              />

              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 p-3 rounded outline-none w-full focus:border-l-4 focus:border-[#EA4424]"
              />

              <input
                type="password"
                placeholder="Password"
                className="border border-gray-300 p-3 rounded outline-none w-full focus:border-l-4 focus:border-[#EA4424]"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="border border-gray-300 p-3 rounded outline-none w-full focus:border-l-4 focus:border-[#EA4424]"
              />
            </div>

            <div className="flex items-center mt-4 text-sm">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-[#EA4424] mr-2"
              />
              <span className="text-gray-700">
                I agree to the Terms & Conditions
              </span>
            </div>

            <div className="flex gap-5 mt-8">
              <button className="bg-[#EA4424] px-8 py-2 text-white">Signup</button>
              <button className="px-8 py-2 border-[#EA4424] border text-[#EA4424]">
                Login
              </button>
            </div>
          </div>

          {/* Right side image */}
          <div className="hidden md:block w-1/2 bg-[#FDFCDB] h-screen">
            <img src={deliveryBoy} alt="Delivery Boy" className="object-contain h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
