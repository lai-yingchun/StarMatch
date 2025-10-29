// src/pages/AnalysisPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { PrimaryButton } from "../components/Buttons";

export default function AnalysisPage() {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
        <div className="w-full md:w-[600px]">
          <SectionCard>
            <div className="flex flex-col items-center text-center gap-8 w-full">
              <div className="text-2xl font-bold text-[#1e4a57]">
                視覺化分析
              </div>

              <div className="flex flex-col gap-6 w-full max-w-[400px]">
                <PrimaryButton
                  className="
                    w-full text-lg py-4 text-white
                    rounded-[999px]
                    shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                  "
                  onClick={() => nav("/celebrity-feature")}
                >
                  名人特徵分佈
                </PrimaryButton>

                <PrimaryButton
                  className="
                    w-full text-lg py-4 text-white
                    rounded-[999px]
                    shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                  "
                  onClick={() => nav("/brand-feature")}
                >
                  品牌特徵分佈
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  );
}