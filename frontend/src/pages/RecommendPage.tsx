// src/pages/RecommendPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import starMatchLogo2 from "../assets/starmatch-logo2.png";

export default function RecommendPage() {
  const nav = useNavigate();
  const [brand, setBrand] = useState("");
  const [artistGender, setArtistGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  function onSearch() {
    const b = brand.trim();
    if (!b) return;

    const params = new URLSearchParams();
    if (artistGender) params.set("artistGender", artistGender);
    if (minAge) params.set("minAge", minAge);
    if (maxAge) params.set("maxAge", maxAge);

    nav(`/results/${encodeURIComponent(b)}?${params.toString()}`);
  }

  const ageOptions = ["", "10", "20", "30", "40", "50", "60", "70", "80"];

  return (
    <Page>
      <NavBar />

      <section
        className="
          flex-1 w-full bg-[rgb(245,245,245)]
          flex items-center justify-center
          px-4 pb-24
        "
        style={{
          minHeight: "calc(100vh - 4rem)",
        }}
      >
        <div className="flex flex-col items-center w-full max-w-[1000px]">
          <div className="flex flex-col items-center mb-0">
            <img
              src={starMatchLogo2}
              alt="StarMatch Logo"
              className="w-[360px] max-w-[80vw] drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div
            className="
              w-full max-w-[800px]
              bg-white rounded-lg
              border-[3px] border-black
              shadow-[8px_8px_0_rgba(0,0,0,0.4)]
              flex items-center
              px-6 py-4
              mb-6
            "
          >
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Brand Name / 品牌名稱"
              className="
                flex-1 text-[20px] md:text-[24px]
                outline-none bg-transparent text-black
                placeholder:text-neutral-500
              "
            />

            <button
              onClick={onSearch}
              className="ml-4 flex items-center justify-center"
              aria-label="search"
            >
              <div
                className="
                  w-[40px] h-[40px] rounded-full
                  border-[4px] border-black
                  relative
                "
              >
                <div
                  className="
                    absolute right-[-6px] bottom-[-6px]
                    w-[16px] h-[4px]
                    bg-black rotate-45 rounded-[2px]
                  "
                />
              </div>
            </button>
          </div>

          <div
            className="
              w-full max-w-[800px]
              bg-white rounded-lg
              border-[3px] border-black
              shadow-[8px_8px_0_rgba(0,0,0,0.4)]
              px-6 py-6
            "
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-800">
              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 text-xs mb-1">
                  代言人性別
                </label>
                <select
                  className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                  value={artistGender}
                  onChange={(e) => setArtistGender(e.target.value)}
                >
                  <option value="">不限</option>
                  <option value="F">女性</option>
                  <option value="M">男性</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 text-xs mb-1">
                  代言人最小年齡
                </label>
                <select
                  className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                >
                  {ageOptions.map((age) => (
                    <option key={age} value={age}>
                      {age === "" ? "不限" : age}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-slate-700 text-xs mb-1">
                  代言人最大年齡
                </label>
                <select
                  className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                >
                  {ageOptions.map((age) => (
                    <option key={age} value={age}>
                      {age === "" ? "不限" : age}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}