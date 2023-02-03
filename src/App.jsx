import { useState, useEffect, useRef } from "react";

const tabSize = 4;

function App() {
   const [text, setText] = useState({
      value: "",
      caret: -1,
      target: null,
   });

   const [lines, setLines] = useState([]);
   const textAreaRef = useRef(null);

   useEffect(() => {
      printTree(parse(text.value));

      if (text.caret >= 0) {
         text.target.setSelectionRange(
            text.caret + tabSize,
            text.caret + tabSize
         );
      }
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

         console.log({ caret, lastNewLine, firstCharacter: indentationLevel });

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
                  onKeyDown={event =>
                     event.key === "Enter" ? event.preventDefault() : null
                  }
                  onKeyUp={handleKeyDown}
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
   if (split[0] === "*" && split[1] === "TODO") {
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

/**
 * Parses .org documents, returning an AST.
 */
function _parse({ tag, children }) {
   const elements = [];
   let element = null;
   let indentation = 0;

   for (let line of children) {
      let isTag = /^(\*+)/.test(line);
      let tag = /^(\*+)/.exec(line)?.[1];

      if (isTag) {
         // If it is a tag
         let newIndentation = tag.length;

         if (newIndentation <= indentation) {
            // We're changing indentation level
            elements.push(_parse(element));
            element = {
               tag: line,
               children: [],
            };
         } else {
            if (element) {
               element.children.push(line);
            } else {
               indentation = newIndentation;
               element = {
                  tag: line,
                  children: [],
               };
            }
         }
      } else {
         // It's not a tag
         if (element) {
            element.children.push(line);
         } else {
            elements.push(line);
         }
      }
   }

   elements.push(element);

   return {
      tag,
      children: elements,
   };
}

function parse(orgText) {
   const children = orgText.split("\n");
   return _parse({ tag: "root", children });
}

function printTree({ tag, children }, level = 0) {
   try {
      console.log(tag);

      if (!children) return;

      for (let child of children) {
         if (child.constructor === String) {
            if (child) {
               console.log(" ".repeat(level + 1) + " " + child);
            }
         } else {
            // debugger;
            printTree(child, level + 1);
         }
      }
   } catch (e) {
      console.log(e);
   }
}

export default App;
