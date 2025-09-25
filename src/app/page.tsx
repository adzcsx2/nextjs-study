"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
export default function Home() {
   const router = useRouter();
   useEffect(() => {
      router.push("/home");
   }, [router]);

   return (
      <div>
         <p></p>
      </div>
   );
}
