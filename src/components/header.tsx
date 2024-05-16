"use client";
import CubeAnimation from "@/components/cube-animation";
import React from "react";

export default function Header() {
  return (
    <div className="flex justify-center w-full pb-16 select-none">
      <CubeAnimation />
      <div className="flex flex-col gap-2 max-w-md select-none w-full justify-center">
        <h1 className="text-2xl pt-72 text-center select-none">
          Joshua Lawrence
        </h1>
        <div className="relative flex gap-4 w-full z-50 background-white justify-center select-none">
          {/* <a href="/projects">Projects</a>
          <a href="/blog">Blog</a>
          <a href="/resume">Resume</a> */}
          <a
            href="https://github.com/joshua-lawrence/"
            target="_blank"
            className="select-none"
          >
            Github
          </a>
          <a
            href="https://www.linkedin.com/in/joshuaglawrence/"
            target="_blank"
            className="select-none"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
