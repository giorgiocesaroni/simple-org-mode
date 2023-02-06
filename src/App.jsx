import { useState, useEffect, useRef, useMemo } from "react";
import { OrgParser } from "./utils/OrgParser";
import { tutorialText } from "./utils/tutorialText";

const tabSize = 4;

function App() {
   const [text, setText] = useState({
      value: "",
      caret: -1,
      target: null,
   });

   const [lines, setLines] = useState([]);
   const textAreaRef = useRef(null);
   const parser = useMemo(() => new OrgParser(), []);

   useEffect(() => {
      if (!localStorage.getItem("text")) {
         return setText({
            value: tutorialText,
            caret: -1,
            target: null,
         });
      }

      setText({
         value: localStorage.getItem("text"),
         caret: -1,
         target: null,
      });
   }, []);

   useEffect(() => {
      localStorage.setItem("text", text.value);

      if (text.caret >= 0) {
         text.target.setSelectionRange(
            text.caret + tabSize,
            text.caret + tabSize
         );
      }

      let parsed = parser.parse(text.value);
      // console.clear();
      // parser.printTree(parsed);
   }, [text]);

   function handleText(event) {
      setText({
         value: event.target.value,
         caret: -1,
         target: event.target,
      });
   }

   function handleKeyDown(event) {
      if (event.code === "Enter") {
         event.preventDefault();

         /**
          * When I press "Enter", I search from the caret and backwards until I find a \n.
          * Then, I analyze how many spaces there are between
          * that first \n and the first character. That's my indentation.
          */
         const caret = event.target.selectionEnd;
         const lastNewLine = text.value.lastIndexOf("\n", caret);
         const indentationLevel = text.value.slice(lastNewLine).search(/\S/);

         const newText =
            text.value.substring(0, event.target.selectionStart) +
            "\n" +
            " ".repeat(tabSize) +
            text.value.substring(event.target.selectionEnd, text.value.length);

         setText({
            value: newText,
            caret: event.target.selectionStart,
            target: event.target,
         });
      }
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
                  ref={textAreaRef}
                  value={text.value}
                  placeholder="Start typing..."
                  className="w-full h-full resize-none outline-none p-4"
                  onChange={handleText}
                  // onKeyDown={event =>
                  //    event.key === "Enter" ? event.preventDefault() : null
                  // }
                  // onKeyUp={handleKeyDown}
               />
            </div>
            <div className="bg-slate-100 overflow-y-scroll flex-1 flex flex-col p-4">
               <Parser data={parser.parse(text.value)} />
            </div>
         </div>
      </div>
   );
}

function Parser({ data }) {
   const [open, setOpen] = useState(true);
   const [hovered, setHovered] = useState(false);

   useEffect(() => {
      setOpen(true);
   }, [data]);

   if (!data.children) return <div className="mb-2">{data}</div>;

   function removeStars(text) {
      if (!text) return null;

      const exec = /\*+ *(.*)/.exec(text);

      if (exec) {
         return exec[1];
      }
   }

   return (
      <div
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         className={`border ${
            hovered ? "border-blue-400 bg-white" : ""
         } p-2 rounded-lg grid gap-2`}
      >
         <header
            className="flex justify-between"
            onClick={() => setOpen(o => !o)}
         >
            <h1 className={`text-gray-${hovered ? 800 : 400}`}>
               {removeStars(data?.tag)}
            </h1>
            <button>
               <img
                  src="chevron.svg"
                  width={14}
                  style={{
                     transform: `rotate(${open ? 270 : 90}deg)`,
                     opacity: 0.25,
                  }}
               />
            </button>
         </header>
         {open &&
            data?.children?.map((child, index) => (
               <Parser key={index} data={child} />
            ))}
      </div>
   );
}

export default App;
