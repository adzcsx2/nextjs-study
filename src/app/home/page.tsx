"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { useEffect } from "react";
const Home: React.FC = () => {
   const router = useRouter();

   useEffect(() => {
      console.log("useEffect");
   }, []);

   return (
      <div>
         <p></p>
      </div>
   );
};

export default Home;
