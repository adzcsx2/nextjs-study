import { use, useEffect, useState } from "react";
import { eventBus } from "@/eventBus/eventBus";

export default function TestComponent() {
   const [count, setCount] = useState(0);

   useEffect(() => {
      const unsubscribe = eventBus.on("testCount", (num) => {
         setCount(num);
      });
      return () => {
         unsubscribe();
      };
   }, []);

   return <div>{count}</div>;
}
