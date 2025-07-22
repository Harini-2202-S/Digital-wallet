import React, { useEffect } from "react";
import "./BackgroundShards.css";

const BackgroundShards = () => {
  useEffect(() => {
    const wrappers = document.querySelectorAll(".shard-wrapper");
    const shards = document.querySelectorAll(".shard");

    wrappers.forEach((wrapper, i) => {
      wrapper.style.top = `${Math.random() * 100}vh`;
      wrapper.style.left = `${Math.random() * 100}vw`;
    });

    shards.forEach((shard) => {
      const duration = 2 + Math.random() * 3;
      const delay = Math.random() * 5;

      shard.style.animationDuration = `${duration}s`;
      shard.style.animationDelay = `${delay}s`;
    });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const offsetX = (clientX - centerX) / centerX;
      const offsetY = (clientY - centerY) / centerY;

      wrappers.forEach((wrapper, index) => {
        const depth = (index + 1) / wrappers.length;
        const moveX = offsetX * 75 * depth;
        const moveY = offsetY * 75 * depth;

        wrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="shard-container">
      {[...Array(100)].map((_, i) => (
        <div key={i} className="shard-wrapper">
          <div className="shard" />
        </div>
      ))}
    </div>
  );
};

export default BackgroundShards;
