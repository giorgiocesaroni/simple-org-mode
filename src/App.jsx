import { useState, useEffect, useRef, useMemo } from "react";
import { OrgParser } from "./utils/OrgParser";
import { tutorialText } from "./utils/tutorialText";
import { intervalToDuration } from "date-fns/esm";

const tabSize = 4;

function App() {
   const [edit, setEdit] = useState(true);
   const [text, setText] = useState({
      value: "",
      caret: -1,
      target: null,
   });

   const textAreaRef = useRef(null);
   const parser = useMemo(() => new OrgParser(), []);

   useEffect(() => {
      setEdit(JSON.parse(localStorage.getItem("edit")));

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
   }, [text]);

   useEffect(() => localStorage.setItem("edit", edit), [edit]);

   function handleText(event) {
      setText({
         value: event.target.value,
         caret: -1,
         target: event.target,
      });
   }

   return (
      <div className="h-full p-3 pb-8 flex flex-col max-w-5xl mx-auto">
         <header className="grid mb-8">
            <h1 className="text-xl font-bold">org-mode on the web</h1>
            <p className="text-slate-400">Let's get organized!</p>
         </header>

         <div className="flex border rounded overflow-hidden h-full">
            {edit && (
               <div className="flex-1">
                  <textarea
                     ref={textAreaRef}
                     value={text.value}
                     placeholder="Start typing..."
                     className="w-full h-full resize-none outline-none p-4"
                     onChange={handleText}
                  />
               </div>
            )}
            <div className="bg-slate-100 overflow-y-scroll flex-1 flex gap-4 flex-col p-4">
               <header className="flex" onClick={() => setEdit(e => !e)}>
                  <button className="ml-auto" style={{ opacity: 0.5 }}>
                     {edit ? (
                        <img src="fullscreen.svg" width={16} height={16} />
                     ) : (
                        <img src="fullscreen-exit.svg" width={16} height={16} />
                     )}
                  </button>
               </header>
               {parser.parse(text.value).children.map(child => (
                  <Parser data={child} />
               ))}
            </div>
         </div>
      </div>
   );
}

function Parser({ data }) {
   const [open, setOpen] = useState(true);
   const [hovered, setHovered] = useState(false);

   let isTodo = /\** *TODO/.test(data.tag);
   let isDone = /\** *DONE/.test(data.tag);
   let isDeadline = /DEADLINE: <(\d{4}-\d{2}-\d{2})( \w{3})?>/;
   let isTime = /SCHEDULED: <(\d{4}-\d{2}-\d{2})( \w{3})?>/;

   let todoBackground = isTodo
      ? "bg-orange-100"
      : isDone
      ? "bg-green-100"
      : "bg-white";

   let todoBorder = isTodo
      ? "border-orange-300"
      : isDone
      ? "border-green-300"
      : "bg-white";

   if (!data.children) {
      // Deadline
      if (isDeadline.test(data)) {
         let time = new Date(isDeadline.exec(data)[1]);
         let expired = new Date() > time;

         let timeRemaining = intervalToDuration({
            start: new Date(),
            end: time,
         });

         return (
            <div>
               <span className="bg-orange-500 text-white font-semibold rounded p-1 text-sm">
                  ⏳ {timeRemaining.years ? `${timeRemaining.years} y. ` : ""}
                  {timeRemaining.months
                     ? `${timeRemaining.months} m. `
                     : ""}{" "}
                  {timeRemaining.days} days {expired ? "overdue" : "remaining"}
               </span>
            </div>
         );
      }

      if (isTime.test(data)) {
         let time = new Date(isTime.exec(data)[1]);

         return (
            <div>
               <span className="bg-blue-500 text-white font-semibold rounded p-1 text-sm">
                  🗓️ {time.toLocaleDateString()}
               </span>
            </div>
         );
      }

      return <div className="mb-2 text-gray-600">{data}</div>;
   }

   function removeStars(text) {
      if (!text) return null;

      const exec = /\*+ *(.*)/.exec(text);

      if (exec) {
         return exec[1];
      }
   }

   function removeTags(text) {
      if (!text) return null;

      const exec = /\**\s*(TODO|SCHEDULED)?\s*(.*)/.exec(text);

      if (exec) {
         return exec[2];
      }
   }

   return (
      <div
         onTouchStart={() => setHovered(true)}
         onTouchEnd={() => setHovered(false)}
         className={`shadow-sm border border-sm p-2 rounded-lg grid gap-2 ${todoBorder} ${todoBackground}`}
      >
         <header
            className="flex justify-between "
            onClick={() => setOpen(o => !o)}
         >
            <h1 className={`font-bold text-gray-700`}>
               {removeTags(removeStars(data?.tag))}
            </h1>
            {data.children.length > 0 && (
               <button>
                  <img
                     src="chevron.svg"
                     width={14}
                     height={14}
                     style={{
                        transform: `rotate(${open ? 270 : 90}deg)`,
                        opacity: 0.25,
                     }}
                  />
               </button>
            )}
         </header>
         {open &&
            data?.children?.map((child, index) => (
               <Parser key={index} data={child} />
            ))}
      </div>
   );
}

export default App;
