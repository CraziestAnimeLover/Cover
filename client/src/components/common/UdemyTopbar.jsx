import React from 'react';

export default function UdemyTopbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded bg-indigo-600 text-white grid place-items-center font-bold">
            U
          </div>
          <span className="font-semibold text-gray-900">Udemy Clone</span>
        </div>

        <div className="ml-auto hidden flex-1 items-center justify-center md:flex">
          <div className="w-full max-w-xl">
            <input
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search for anything"
              readOnly
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Log in
          </button>
          <button className="rounded-full bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}

