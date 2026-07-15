import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./coach/BottomNav";

export default function CoachLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}