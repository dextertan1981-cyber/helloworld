import React from 'react';
import { HelloWorld } from './components/HelloWorld';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <HelloWorld />
    </div>
  );
};

export default App;