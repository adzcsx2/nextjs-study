// "use client";
import { useEffect, useState } from "react";

export default function Test() {
   const [number, setNumber] = useState(0);

   useEffect(() => {
      console.log("useEffect", number);
   });

   useEffect(() => {
      console.log("useEffect2");
   }, []);

   return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
         <h1>Test {number}</h1>
         <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
               setNumber(number + 1);
            }}
         >
            Click me
         </button>
      </div>
   );
}
