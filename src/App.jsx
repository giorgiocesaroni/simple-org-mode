import { useState, useEffect } from "react";

function App() {
   const [lines, setLines] = useState([]);

   function handleChange(event) {
      const value = event.target.value;
      setLines(value.split("\n"));
   }

   useEffect(() => {
      console.log(lines);
   }, [lines]);

   return (
      <div className="h-full p-3">
         <h1 className="text-xl font-bold mb-8">org-mode on the web</h1>

         <div className="flex border rounded overflow-hidden">
            <div className="flex-1">
               <textarea
                  placeholder="Type to start..."
                  className="w-full h-full resize-none outline-none p-4"
                  onChange={handleChange}
               />
            </div>
            <div className="bg-slate-200 flex-1 flex flex-col p-4">
               {lines.map((line, index) => (
                  <Parser>{line}</Parser>
               ))}
            </div>
         </div>
      </div>
   );
}

function Parser({ children }) {
   console.log(children[0]);

   if (children[0] === "*") {
      return <h1 className="text-xl font-bold my-4">{children.slice(2)}</h1>;
   } else {
      return <span>{children}</span>;
   }
}

export default App;
