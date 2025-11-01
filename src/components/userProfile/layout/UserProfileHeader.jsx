import React from 'react';
import { useSelector } from 'react-redux';

const UserProfileHeader = () => {
  const user = useSelector((state) => state.auth.user);
  console.log(user)

  return (
    <div className="bg-orange-600 text-white px-6 py-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
          {/* <p className="text-teal-100 text-lg">{user.phone}</p> */}
          <p className="text-teal-100 text-lg">{user.email}</p>
        </div>
        <button className="border border-orange-300 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded text-l tracking-wide">
          EDIT PROFILE
        </button>
      </div>
    </div>
  );
};

export default UserProfileHeader;