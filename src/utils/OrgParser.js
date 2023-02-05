export class OrgParser {
   printTree({ tag, children }, level = 0) {
      try {
         console.log(" ".repeat(level) + " " + tag);

         if (!children) return;

         for (let child of children) {
            if (child.constructor === String) {
               if (child) {
                  console.log(" ".repeat(level + 1) + " " + child);
               }
            } else {
               // debugger;
               this.printTree(child, level + 1);
            }
         }
      } catch (e) {
         console.log(e);
      }
   }

   _parse({ tag, children }) {
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
               elements.push(this._parse(element));
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

      if (element) {
         elements.push(this._parse(element));
      }

      return {
         tag,
         children: elements,
      };
   }

   parse(orgText) {
      const children = orgText.split("\n");
      return this._parse({ tag: "root", children });
   }
}
