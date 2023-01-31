import { useState, useEffect } from "react";

function App() {
   const [text, setText] = useState("");
   const [lines, setLines] = useState([]);

   useEffect(() => {
      setText(localStorage.getItem("text"));
      setLines(localStorage.getItem("text")?.split("\n") ?? []);
   }, []);

   function handleChange(event) {
      const value = event.target.value;
      setText(value);
      setLines(value.split("\n"));

      localStorage.setItem("text", value);
   }

   return (
      <div className="h-full p-3 pb-8 flex flex-col touch-none">
         <div className="mb-8">
            <h1 className="text-xl font-bold">org-mode on the web</h1>
            <p className="text-slate-400">Let's get organized!</p>
         </div>

         <div className="flex border rounded overflow-hidden h-full">
            <div className="flex-1">
               <textarea
                  value={text}
                  placeholder="Start typing..."
                  className="w-full h-full resize-none outline-none p-4"
                  onChange={handleChange}
               />
            </div>
            <div className="bg-slate-100 overflow-y-scroll flex-1 flex flex-col p-4">
               {lines.map((line, index) => (
                  <Parser>{line}</Parser>
               ))}
            </div>
         </div>
      </div>
   );
}

function Parser({ children: line }) {
   const split = line.split(/\s+/);

   // TODO Section
   if (split[1] === "TODO") {
      return (
         <div className="my-2">
            <span className="bg-yellow-400 rounded px-1 font-semibold">
               TODO
            </span>{" "}
            <span>{split.slice(2).join(" ")}</span>
         </div>
      );
   }

   if (split[0] === "*") {
      return (
         <h1 className="text-2xl font-bold my-4">{split.slice(1).join(" ")}</h1>
      );
   } else if (split[0] === "**") {
      return (
         <h1 className="text-xl font-bold my-4">{split.slice(1).join(" ")}</h1>
      );
   } else if (split[0] === "***") {
      return (
         <h1 className="text-md font-bold my-4">{split.slice(1).join(" ")}</h1>
      );
   } else {
      return <span>{line}</span>;
   }
}

export default App;
