import React, { useState, useEffect } from "react";
import starMatchLogo from "./assets/starmatch-logo.png";
import starMatchLogo2 from "./assets/starmatch-logo2.png";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import CelebrityFeature from "./CelebrityFeature";

/* =========================================================
   API types & client (call backend instead of CSV)
========================================================= */

// 你的後端 base URL
const API_BASE = "http://127.0.0.1:8000";

// 後端回傳的推薦清單 item
type Recommendation = {
  id: string;    // 藝人名字 (ex. "林志玲")
  name: string;  // 顯示名稱 (通常等於 id)
  score: number; // 0~10
};

// 前端顯示在 CandidateDetail 頁面要用的資料模型
type CandidateDetailVM = {
  id: string;
  name: string;
  score: number;
  persona: string;
  reasonText: string;
  pastBrands: string[];
  similarArtists: string[];
};

// 小幫手：跟後端拿資料
const api = {
  async recommendForBrand(
    brand: string,
    opts: {
      topK?: number;
      artistGender?: string; // "M" | "F"
      minAge?: number;
      maxAge?: number;
    } = {}
  ): Promise<Recommendation[]> {
    const params = new URLSearchParams();
    params.set("topK", String(opts.topK ?? 10));
    if (opts.artistGender) params.set("artistGender", opts.artistGender);
    if (opts.minAge !== undefined) params.set("minAge", String(opts.minAge));
    if (opts.maxAge !== undefined) params.set("maxAge", String(opts.maxAge));

    const res = await fetch(
      `${API_BASE}/recommendations/${encodeURIComponent(
        brand
      )}?${params.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      console.error("recommendForBrand error", res.status);
      return [];
    }

    const data = await res.json();
    return data.results ?? [];
  },


  // ✅ 只打 /candidate，不自動打 /explanation
  async getCandidateDetail(
    artistName: string,
    brandName?: string
  ): Promise<CandidateDetailVM> {
    const url = `${API_BASE}/candidate/${encodeURIComponent(
      artistName
    )}?brand=${encodeURIComponent(brandName ?? "")}`;

    console.log("[frontend] fetch candidate:", url);
    const resp = await fetch(url);

    if (!resp.ok) {
      console.error("getCandidateDetail error", resp.status);
      throw new Error("candidate fetch failed");
    }

    const raw = await resp.json();
    console.log("[frontend] candidate raw =", raw);

    const vm: CandidateDetailVM = {
      id: artistName,
      name: raw.name ?? artistName,
      score: raw.score ?? 0,
      persona: raw.persona ?? "（此藝人尚無詳細介紹）",
      reasonText: raw.reasonText ?? "",
      pastBrands: raw.pastBrands ?? [],
      similarArtists: raw.similarArtists ?? [],
    };

    return vm;
  },
};

/* =========================================================
   共用 UI Components
========================================================= */

export const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-white text-slate-900">
    {children}
  </div>
);

export type SectionCardProps = {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  right,
  children,
  className = "",
}) => (
  <div
    className={`
      bg-rose-50/40
      border border-rose-100
      rounded-2xl
      p-5
      shadow-sm
      ${className}
    `}
  >
    {(title || right) && (
      <div className="flex items-center justify-between mb-3">
        {title ? (
          <h2 className="text-2xl font-semibold text-slate-800 tracking-wide">
            {title}
          </h2>
        ) : (
          <div />
        )}
        {right}
      </div>
    )}
    {children}
  </div>
);

export const PrimaryButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-white rounded-full shadow hover:opacity-95 active:opacity-90 transition ${className}`}
    style={{ backgroundColor: "#2b6777" }}
  >
    <span className="text-xl font-semibold tracking-wide">{children}</span>
  </button>
);

const GhostButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition ${className}`}
  >
    {children}
  </button>
);

const ScorePill = ({ score }: { score: number }) => (
  <div className="px-3 py-1 rounded-full bg-white border shadow-sm text-slate-700 text-sm min-w-[56px] text-center">
    {score.toFixed(1)}/10
  </div>
);

/* =========================================================
   NavBar
========================================================= */

export const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavLinkBtn = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`
        relative px-4 py-2 text-sm font-semibold tracking-wide transition
        ${isActive(to) ? "text-[#1e4a57]" : "text-slate-900 hover:text-[#1e4a57]"}
      `}
    >
      {label}
      <span
        className={`
          absolute left-1/2 -bottom-1 -translate-x-1/2
          h-[3px] rounded-full transition-all
          ${isActive(to) ? "w-6 bg-[#1e4a57]" : "w-0 bg-transparent"}
        `}
      />
    </Link>
  );

  return (
    <header
      className="
        sticky top-0 z-40
        backdrop-blur-md
        bg-[#f7d9dc]    // 深一點的粉紅
        border-b border-[#f1c9cc]
        shadow-[0_4px_10px_rgba(0,0,0,0.05)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 左邊 Logo 區塊 */}
        <Link to="/" className="flex flex-col leading-tight group">
          <span
            className="
              font-black tracking-wider text-lg text-[#0f172a]
              group-hover:text-[#1e4a57] transition-colors
            "
          >
            STARMATCH
          </span>

          <span
            className="
              text-[11px] font-medium tracking-[0.08em]
              text-[#1e293b]
              group-hover:text-[#1e4a57]/80 transition-colors
            "
          >
            BRAND × CELEBRITY
          </span>
        </Link>

        {/* 導覽列 */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinkBtn to="/" label="HOME" />
          <NavLinkBtn to="/recommend" label="RECOMMENDATION" />
          <NavLinkBtn to="/analysis" label="ANALYSIS" />
          <NavLinkBtn to="/news" label="NEWS" />
        </nav>

        {/* 手機選單按鈕 */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-slate-400/40 hover:bg-white/40 transition"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="w-5 h-0.5 bg-slate-800 mb-1 rounded" />
          <div className="w-5 h-0.5 bg-slate-800 mb-1 rounded" />
          <div className="w-5 h-0.5 bg-slate-800 rounded" />
        </button>
      </div>

      {/* 手機版 dropdown */}
      {open && (
        <div
          className="
            md:hidden flex flex-col gap-2 px-4 pb-4
            bg-[rgba(255,232,235,0.7)]/80
            backdrop-blur-xl
            border-t border-rose-200/70
          "
        >
          {["HOME", "RECOMMEND", "ANALYSIS", "NEWS"].map((label, i) => {
            const path =
              label === "HOME"
                ? "/"
                : `/${label.toLowerCase()}`;
            return (
              <Link
                key={i}
                to={path}
                className="py-2 text-slate-900 font-semibold tracking-wide"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
/* =========================================================
   Pages
========================================================= */

/* Home */
const Home = () => {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <section className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-white">
        {/* 背景圓 */}
        <div
          className="
            absolute top-[-20vh] left-[-20vh]
            w-[140vh] h-[140vh]
            rounded-full
            bg-[rgb(250,244,242)]
            shadow-[0_60px_120px_rgba(0,0,0,0.06)]
            pointer-events-none
          "
        />

        {/* 主內容：logo + 按鈕 */}
        <div
          className="
            relative z-10 flex w-full max-w-[1400px] px-8 gap-8
          "
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr",
            alignItems: "center",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <img
              src={starMatchLogo}
              alt="StarMatch Logo"
              className="w-[420px] max-w-full drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-10">
            <button
              onClick={() => nav("/recommend")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              開始推薦
            </button>

            <button
              onClick={() => nav("/analysis")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              探索更多
            </button>

            <button
              onClick={() => nav("/news")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              最新消息
            </button>
          </div>
        </div>
      </section>
    </Page>
  );
};

/* Recommend (輸入品牌) */
const Recommend = () => {
  const nav = useNavigate();

  const [brand, setBrand] = useState("");

  // 篩選條件 state
  const [artistGender, setArtistGender] = useState(""); // "" | "M" | "F"
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
          minHeight: "calc(100vh - 4rem)", // 4rem ~= 64px navbar height
        }}
      >
        <div className="flex flex-col items-center w-full max-w-[1000px]">

          {/* ============ Logo ============ */}
          <div className="flex flex-col items-center mb-0">
            <img
              src={starMatchLogo2}
              alt="StarMatch Logo"
              className="w-[360px] max-w-[80vw] drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* ============ 搜尋框卡片 ============ */}
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
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
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
              {/* 放大鏡 */}
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

          {/* ============ 篩選條件卡片 ============ */}
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
              {/* 性別 */}
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

              {/* 最小年齡 */}
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

              {/* 最大年齡 */}
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
};

/* Results (推薦清單) */
// 小工具：讀當前 URL 的 querystring
function useQueryParams() {
  const loc = useLocation();
  return React.useMemo(() => new URLSearchParams(loc.search), [loc.search]);
}

/* Results (推薦清單) */
const Results = () => {
  const { brand } = useParams();
  const query = useQueryParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Recommendation[]>([]);
  const nav = useNavigate();
  const location = useLocation();

  // 從 URL 上抓篩選參數（如果沒帶就會是 null）
  const artistGender = query.get("artistGender") || "";
  const minAgeStr = query.get("minAge") || "";
  const maxAgeStr = query.get("maxAge") || "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      const res = await api.recommendForBrand(
        decodeURIComponent(brand || ""),
        {
          topK: 10,
          artistGender: artistGender || undefined,
          minAge: minAgeStr ? Number(minAgeStr) : undefined,
          maxAge: maxAgeStr ? Number(maxAgeStr) : undefined,
        }
      );

      if (mounted) {
        setItems(res);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [brand, artistGender, minAgeStr, maxAgeStr]); // 參數改變就重新抓

  return (
    <Page>
      <NavBar />

      <div className="mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 w-full max-w-[1200px]">
        {/* 左側：候選名單 */}
        <SectionCard
          title={
            <div className="flex flex-col">
              <span>候選人名單</span>

              <span className="text-xs text-slate-500 font-normal mt-1">
                {/* 性別部分 */}
                {artistGender
                  ? artistGender === "F"
                    ? "女性藝人"
                    : "男性藝人"
                  : "不限性別"}

                ／

                {/* 年齡部分 */}
                {minAgeStr || maxAgeStr
                  ? (
                    maxAgeStr
                      ? `${minAgeStr || "?"}～${maxAgeStr} 歲藝人`
                      : `年齡≥${minAgeStr} 歲藝人`
                  )
                  : "不限年齡"
                }
              </span>
            </div>
          }
        >
          {loading ? (
            <div className="py-16 text-center text-slate-500">載入中⋯</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              沒有符合條件的代言人
            </div>
          ) : (
            <div className="max-h-[460px] overflow-auto pr-2">
              {items.map((it, idx) => (
                <div
                  key={it.id + idx}
                  className="
                    flex items-center justify-between gap-3
                    px-3 py-3
                    rounded-xl
                    hover:bg-white/70
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        w-8 h-8 rounded-full
                        grid place-items-center
                        text-white font-bold
                      "
                      style={{ backgroundColor: "#2b6777" }}
                    >
                      {idx + 1}
                    </div>

                    <div className="text-lg font-semibold">{it.name}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScorePill score={it.score} />
                    <PrimaryButton
                      className="!px-4 !py-2 !text-base"
                      onClick={() =>
                        nav(`/candidate/${encodeURIComponent(it.id)}`, {
                          state: {
                            from: location.pathname + location.search,
                            brand,
                          } as any
                        })
                      }
                    >
                      查看解釋
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 右側保持不變 */}
        <SectionCard>
          <div className="flex flex-col items-center text-center gap-6 h-full py-4">
            <div className="text-2xl font-bold text-[#1e4a57]">
              視覺化分析
            </div>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => nav("/celebrity-feature")}
            >
              名人特徵比對
            </PrimaryButton>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => alert("TODO: 品牌趨勢分析（群聚/時序）")}
            >
              品牌趨勢分析
            </PrimaryButton>

            <GhostButton
              className="w-[80%] max-w-[320px] text-lg py-3"
              onClick={() => window.history.back()}
            >
              回上一頁
            </GhostButton>
          </div>
        </SectionCard>
      </div>
    </Page>
  );
};

/* CandidateDetail (單一藝人詳情) */
const CandidateDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation() as { state?: { brand?: string } };

  const [data, setData] = useState<CandidateDetailVM | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);      // 整個頁面基本資料
  const [loadingReason, setLoadingReason] = useState(true);  // 推薦原因
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingPage(true);
        setErrorMsg(null);

        // 1. 先拿基本資料（不會叫 LLM 了，應該很快）
        const base = await api.getCandidateDetail(
          id || "",
          location.state?.brand
        );

        if (mounted) {
          setData(base);
          setLoadingPage(false);
        }

        // 2. 再去拿推薦原因 (LLM)
        if (mounted) {
          setLoadingReason(true);
        }

        if (mounted && (!base.reasonText) && location.state?.brand) {
          const explainUrl = `${API_BASE}/explanation/${encodeURIComponent(
            location.state.brand
          )}/${encodeURIComponent(base.name)}`;

          console.log("[frontend] fetch explanation:", explainUrl);
          try {
            const res2 = await fetch(explainUrl);
            if (res2.ok) {
              const data2 = await res2.json();
              console.log("[frontend] explanation raw =", data2);

              if (mounted) {
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        reasonText: data2.recommendation_reason ?? "",
                      }
                    : prev
                );
              }
            } else {
              console.error("explanation fetch failed", res2.status);
            }
          } catch (err) {
            console.error("explanation fetch error", err);
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

  // --- 整頁還在抓基本資料 ---
  if (loadingPage || !data) {
    return (
      <Page>
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-500">
          {errorMsg ? (
            <div className="text-red-600">{errorMsg}</div>
          ) : (
            <div className="text-slate-600 text-lg text-center">
              載入中…
            </div>
          )}
        </div>
      </Page>
    );
  }

  // --- 基本資料拿到了，開始正常 render ---
  return (
    <Page>
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* 左上：人設 + 分數 + 回上一頁 */}
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

        {/* 右上：推薦原因 */}
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

        {/* 左下：品牌合作 */}
        <SectionCard title="曾經合作過的品牌">
          {data.pastBrands && data.pastBrands.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2">
              {data.pastBrands.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-500">目前沒有合作品牌資料</div>
          )}
        </SectionCard>

        {/* 右下：相似藝人 */}
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
};

/* Analysis */
const Analysis = () => {
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
                  名人特徵比對
                </PrimaryButton>

                <PrimaryButton
                  className="
                    w-full text-lg py-4 text-white
                    rounded-[999px]
                    shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                  "
                  onClick={() => alert("TODO: 品牌群聚與產業趨勢視覺化")}
                >
                  品牌趨勢分析
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  );
};

/* News (demo 假資料，這段還是前端 mock，因為後端還沒做新聞 API) */
const mockNews = [
  {
    title: "筆電品牌釋出新系列形象片，鎖定年輕族群",
    date: "2025-10-18",
    source: "Tech Insight",
    url: "",
    summary:
      "主打質感、創作力與行動工作者定位，找來音樂人與影像創作者入鏡，明顯走向潮流而非硬規格訴求。",
  },
  {
    title: "行動外送平台完成多代言人組合策略 A/B 測試",
    date: "2025-10-12",
    source: "廣告觀察",
    url: "",
    summary:
      "此輪測試同時比較頂流歌手與綜藝咖的轉換率，結果顯示『雙代言組合』對年輕族群點擊成長最明顯。",
  },
  {
    title: "運動品牌攜手頂尖球星展開形象合作",
    date: "2025-10-10",
    source: "體育產業動態",
    url: "",
    summary:
      "該品牌宣布與國際級球星展開年度品牌合作，強調專業力與運動精神，後續預計推出聯名社群挑戰活動。",
  },
];

const News = () => {
  const hasNews = mockNews.length > 0;

  return (
    <Page>
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
        <SectionCard
          className="w-full md:w-[700px]"
          title={
            <span className="flex flex-col">
              <span className="text-[#1e4a57] font-bold text-2xl">
                最新消息
              </span>
              <span className="text-base text-slate-500 font-normal">
                （廣告/代言/品牌合作即時追蹤）
              </span>
            </span>
          }
        >
          <p className="text-slate-600 leading-relaxed mb-6">
            以下內容可以由排程式工作（例如 Scrapy 爬蟲 + Celery 排程）自動更新。
            Demo 目前使用假資料。
          </p>

          {hasNews ? (
            <ul className="space-y-4">
              {mockNews.map((n, i) => (
                <li
                  key={i}
                  className="
                    rounded-lg border border-slate-200 bg-white p-4 shadow-sm
                  "
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-slate-800 text-lg">
                      {n.title}
                    </div>

                    <div className="text-sm text-slate-500 flex flex-wrap gap-2">
                      <span>{n.date}</span>
                      {n.source && <span className="text-slate-400">·</span>}
                      {n.source &&
                        (n.url ? (
                          <a
                            className="underline text-slate-500 hover:text-slate-700"
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {n.source}
                          </a>
                        ) : (
                          <span>{n.source}</span>
                        ))}
                    </div>

                    {n.summary && (
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {n.summary}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-400 py-16">
              目前沒有新消息
            </div>
          )}
        </SectionCard>
      </div>
    </Page>
  );
};

/* =========================================================
   Root App with Routes
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/results/:brand" element={<Results />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/celebrity-feature" element={<CelebrityFeature />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </BrowserRouter>
  );
}