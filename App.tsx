import React from 'react';
import { Hello } from './Hello';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <Hello />
    </div>
  );
};

export default App;