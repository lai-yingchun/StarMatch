import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { GhostButton } from "../components/Buttons";
import { ScorePill } from "../components/ScorePill";
import type { CandidateDetailVM } from "../api/api";
import { getCandidateDetail, getLLMExplanation } from "../api/api";
export default function CandidateDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation() as { state?: { brand?: string } };

  const [data, setData] = useState<CandidateDetailVM | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingReason, setLoadingReason] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {

    let mounted = true;

    (async () => {
      try {
        setLoadingPage(true);
        setErrorMsg(null);

        const base = await getCandidateDetail(id || "", location.state?.brand);

        if (mounted) {
          setData(base);
          setLoadingPage(false);
        }

        if (mounted) {
          setLoadingReason(true);
        }

        if (mounted && (!base.reasonText) && location.state?.brand) {
          const reason = await getLLMExplanation(
            location.state.brand!,
            base.name
          );

          if (mounted) {
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    reasonText: reason,
                  }
                : prev
            );
          }
        }

        if (mounted) {
          setLoadingReason(false);
        }
      } catch (err) {
        console.error("CandidateDetail error", err);
        if (mounted) {
          setErrorMsg("資料載入失敗");
          setLoadingPage(false);
          setLoadingReason(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, location.state?.brand]);

  if (loadingPage || !data) {
    return (
      <Page>
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-500">
          {errorMsg ? (
            <div className="text-red-600">{errorMsg}</div>
          ) : (
            <div className="text-slate-600 text-lg text-center">載入中…</div>
          )}
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <SectionCard
          title={
            <span className="flex flex-wrap items-baseline gap-4">
              <span className="text-slate-900 font-bold text-2xl">
                Name: {data.name}
              </span>
              <ScorePill score={data.score} />
              <GhostButton onClick={() => nav(-1)}>回上一頁</GhostButton>
            </span>
          }
        >
          <div className="p-4 border rounded-xl bg-white leading-8">
            {data.persona || "（此藝人尚無詳細介紹）"}
          </div>
        </SectionCard>

        <SectionCard title="推薦原因">
          {loadingReason ? (
            <div className="text-slate-500">推薦原因生成中…</div>
          ) : data.reasonText && data.reasonText.length > 0 ? (
            <p className="leading-8 text-slate-800 whitespace-pre-line">
              {data.reasonText}
            </p>
          ) : (
            <div className="text-slate-500">目前沒有推薦原因資料</div>
          )}
        </SectionCard>

        <SectionCard title="曾經合作過的品牌">
          {data.pastBrands && data.pastBrands.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2">
              {data.pastBrands
                .filter(
                  (b) =>
                    !location.state?.brand || // 如果沒有傳入目前品牌就不過濾
                    b.trim().toLowerCase() !== location.state.brand.trim().toLowerCase() // 過濾掉目前品牌
                )
                .map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
            </ul>
          ) : (
            <div className="text-slate-500">目前沒有合作品牌資料</div>
          )}
        </SectionCard>

        <SectionCard title="相似藝人">
          {data.similarArtists && data.similarArtists.length > 0 ? (
            <ol className="list-decimal pl-6 grid gap-2">
              {data.similarArtists.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : (
            <div className="text-slate-500">目前沒有相似藝人資料</div>
          )}
        </SectionCard>
      </div>
    </Page>
  );
}