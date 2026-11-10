import React from 'react';
import { Link } from 'react-router-dom';
import { User, Building, ArrowRight } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F7F3]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block group">
          <img
            src="/logo.png"
            alt="GauAashray Logo"
            className="h-20 w-auto mx-auto object-contain group-hover:scale-105 transition"
          />
        </Link>
        <h2 className="mt-3 text-3xl font-extrabold text-[#593713] tracking-tight">
          Join GauAashray
        </h2>
        <p className="mt-1 text-xs font-semibold text-[#80501D]">
          Select account type to begin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-stone-200 space-y-4">
          {/* Choice A: Public User */}
          <Link
            to="/signup/public"
            className="block p-5 rounded-2xl border-2 border-stone-200 hover:border-[#80501D] bg-stone-50/50 hover:bg-[#FAF6ED] transition duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#80501D] flex items-center justify-center group-hover:scale-110 transition">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Public User</h3>
                  <p className="text-xs text-stone-500">
                    Report street cows, request veterinary doctors, or surrender cows.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-[#80501D] group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Choice B: Gaushala Owner */}
          <Link
            to="/signup/gaushala"
            className="block p-5 rounded-2xl border-2 border-stone-200 hover:border-[#80501D] bg-stone-50/50 hover:bg-[#FAF6ED] transition duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#80501D] flex items-center justify-center group-hover:scale-110 transition">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Gaushala Owner / Shelter</h3>
                  <p className="text-xs text-stone-500">
                    Register an organization, manage multiple branches, doctors and rescue teams.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-[#80501D] group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <div className="pt-4 text-center text-xs text-stone-600">
            Already registered?{' '}
            <Link to="/login" className="text-[#80501D] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

