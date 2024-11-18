// pages/index.js
import React from "react";
import HomePage from "../components/HomePage";
import SectionWithCards from "../components/SectionWithCards";
import '../../src/styles/globals.css';


const Index = () => {
  return (
    <>
      <HomePage />
      <SectionWithCards />
    </>
  );
};

export default Index;
