import React from 'react';

export const Hello: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-slate-100 transform transition-all hover:scale-105 duration-300">
      <div className="mb-6 flex justify-center">
        <span className="text-6xl animate-bounce">👋</span>
      </div>
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 tracking-tight">
        Hello World
      </h1>
      <p className="text-slate-500 text-lg font-medium">
        喵库长的第一个网站
      </p>
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Ready for Production
        </p>
      </div>
    </div>
  );
};
