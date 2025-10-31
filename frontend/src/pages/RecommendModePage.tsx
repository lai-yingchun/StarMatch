import { useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { PrimaryButton } from "../components/Buttons";

export default function RecommendModePage() {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />

      <div className="flex-1 w-full bg-[rgb(245,245,245)] flex items-center justify-center px-4">
        <div className="w-full max-w-[900px] grid gap-6">
          <SectionCard
            title="選擇推薦方式"
            className="bg-white border-[3px] border-black shadow-[8px_8px_0_rgba(0,0,0,0.4)]"
          >
            <p className="text-slate-700 leading-relaxed mb-6">
              你可以直接輸入品牌名稱，或使用品牌敘述（如品牌語調、目標客群）來尋找可能契合的代言人。
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  已知品牌名稱
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  適合已知要比對的品牌，使用既有的品牌資料直接產出符合條件的代言人。
                </p>
                <PrimaryButton
                  className="w-full text-lg py-3"
                  onClick={() => nav("/recommend")}
                >
                  以品牌名稱搜尋
                </PrimaryButton>
              </div>

              <div className="p-6 border border-slate-200 rounded-2xl bg-white flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  只有品牌敘述
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  將品牌背景、語氣或欲溝通族群以文字描述輸入，系統會匹配相近品牌後推薦代言人。
                </p>
                <PrimaryButton
                  className="w-full text-lg py-3"
                  onClick={() => nav("/recommend-description")}
                >
                  以品牌敘述搜尋
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  );
}
