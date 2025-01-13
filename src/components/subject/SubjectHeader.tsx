import { useMobile } from "@/hooks/use-mobile";
import React from "react";

const SubjectHeader = ({ title }: { title: string }) => {
  const isMobile = useMobile();

  return (
    <header className={`p-4 ${isMobile ? "text-sm" : "text-lg"}`}>
      <h1 className="font-bold">{title}</h1>
    </header>
  );
};

export default SubjectHeader;
