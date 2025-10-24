import React, { useMemo, useState, useEffect } from "react";
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

/* ------------------------- UI 元件 ------------------------- */
const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-white text-slate-900">
    {children}
  </div>
);

type SectionCardProps = {
  title?: React.ReactNode;      // ← 支援 JSX，不限文字
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;           // ← 允許外部客製樣式
};

const SectionCard: React.FC<SectionCardProps> = ({
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

const PrimaryButton = ({
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

/* ------------------------- 導覽列 ------------------------- */
const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-semibold tracking-wide ${
        location.pathname === to ? "underline" : ""
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="sticky top-0 z-40 bg-rose-200/80 backdrop-blur border-b border-rose-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-black tracking-wider">
          HOME
        </Link>
        <div className="hidden md:flex items-center gap-2">
          {link("/recommend", "RECOMMEND")}
          {link("/analysis", "ANALYSIS")}
          {link("/news", "NEWS")}
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
          <div className="w-6 h-0.5 bg-slate-800 mb-1" />
          <div className="w-6 h-0.5 bg-slate-800 mb-1" />
          <div className="w-6 h-0.5 bg-slate-800" />
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2">
          <Link
            to="/recommend"
            className="py-2"
            onClick={() => setOpen(false)}
          >
            RECOMMEND
          </Link>
          <Link to="/analysis" className="py-2" onClick={() => setOpen(false)}>
            ANALYSIS
          </Link>
          <Link to="/news" className="py-2" onClick={() => setOpen(false)}>
            NEWS
          </Link>
        </div>
      )}
    </div>
  );
};

/* ------------------------- 首頁 ------------------------- */
const Home = () => {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <section
        className="
          relative
          flex-1
          w-full
          flex
          items-center
          justify-center
          overflow-hidden
          bg-white
        "
      >
        {/* 巨大圓背景 */}
        <div
          className="
            absolute
            top-[-20vh]
            left-[-20vh]
            w-[140vh]
            h-[140vh]
            rounded-full
            bg-[rgb(250,244,242)]
            shadow-[0_60px_120px_rgba(0,0,0,0.06)]
            pointer-events-none
          "
        />

        {/* 內容容器：左右兩塊 */}
        <div
          className="
            relative
            z-10
            flex
            w-full
            max-w-[1400px]
            px-8
            gap-8
          "
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr",
            alignItems: "center",
          }}
        >
          {/* 左側 Logo */}
          <div className="flex flex-col items-center justify-center">
            <img
              src={starMatchLogo}
              alt="StarMatch Logo"
              className="
                w-[420px]
                max-w-full
                drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]
              "
            />
          </div>

          {/* 右側按鈕 */}
          <div className="flex flex-col items-center justify-center gap-10">
            <button
              onClick={() => nav('/recommend')}
              className="
                w-[400px]
                rounded-[60px]
                px-10
                py-6
                text-white
                font-semibold
                text-[32px]
                leading-none
                tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition
                hover:opacity-90
              "
              style={{ backgroundColor: '#2b6777' }}
            >
              開始推薦
            </button>

            <button
              onClick={() => nav('/analysis')}
              className="
                w-[400px]
                rounded-[60px]
                px-10
                py-6
                text-white
                font-semibold
                text-[32px]
                leading-none
                tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition
                hover:opacity-90
              "
              style={{ backgroundColor: '#2b6777' }}
            >
              探索更多
            </button>

            <button
              onClick={() => nav('/news')}
              className="
                w-[400px]
                rounded-[60px]
                px-10
                py-6
                text-white
                font-semibold
                text-[32px]
                leading-none
                tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition
                hover:opacity-90
              "
              style={{ backgroundColor: '#2b6777' }}
            >
              最新消息
            </button>
          </div>
        </div>
      </section>
    </Page>
  );
};

/* ------------------------- 輸入品牌頁 ------------------------- */
const Recommend = () => {
  const nav = useNavigate();
  const [brand, setBrand] = React.useState("");

  function onSearch() {
    if (!brand.trim()) return;
    nav(`/results/${encodeURIComponent(brand.trim())}`);
  }

  return (
    <Page>
      <NavBar />

      {/* 全畫面容器：灰底，內容垂直水平都置中 */}
      <section
        className="
          flex-1
          w-full
          bg-[rgb(245,245,245)]
          flex
          items-center
          justify-center
          px-4
          pb-24
        "
      >
        {/* 中心模組：Logo + 搜尋框，作為一個整塊 */}
        <div className="flex flex-col items-center w-full max-w-[1000px]">
          {/* Logo 區塊 */}
          <div className="flex flex-col items-center mb-0">
            <img
              src={starMatchLogo2}
              alt="StarMatch Logo"
              className="
                w-[360px]
                max-w-[80vw]
                drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]
              "
            />
          </div>

          {/* 搜尋框 */}
          <div
            className="
              w-full
              max-w-[800px]
              bg-white
              rounded-lg
              border-[3px]
              border-black
              shadow-[8px_8px_0_rgba(0,0,0,0.4)]
              flex
              items-center
              px-6
              py-4
            "
          >
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Brand Name"
              className="
                flex-1
                text-[24px]
                outline-none
                bg-transparent
                text-black
                placeholder:text-neutral-500
              "
            />

            {/* 放大鏡 icon */}
            <button
              onClick={onSearch}
              className="ml-4 flex items-center justify-center"
              aria-label="search"
            >
              <div
                className="
                  w-[40px]
                  h-[40px]
                  rounded-full
                  border-[4px]
                  border-black
                  relative
                "
              >
                <div
                  className="
                    absolute
                    right-[-6px]
                    bottom-[-6px]
                    w-[16px]
                    h-[4px]
                    bg-black
                    rotate-45
                    rounded-[2px]
                  "
                />
              </div>
            </button>
          </div>
        </div>
      </section>
    </Page>
  );
};

/* ------------------------- 推薦結果清單頁 ------------------------- */
const Results = () => {
  const { brand } = useParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Recommendation[]>([]);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await api.recommendForBrand(
        decodeURIComponent(brand || ""),
        { topK: 10 }
      );
      if (mounted) setItems(res);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [brand]);

  return (
    <Page>
      <NavBar />

      {/* 主體容器：稍微放寬，置中 */}
      <div
        className="
          mx-auto
          px-4
          py-8
          grid
          md:grid-cols-2
          gap-8
          w-full
          max-w-[1200px]
        "
      >
        {/* 左側：候選人名單（維持原本 SectionCard header 樣式） */}
        <SectionCard title="候選人名單">
          {loading ? (
            <div className="py-16 text-center text-slate-500">載入中⋯</div>
          ) : (
            <div className="max-h-[460px] overflow-auto pr-2">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="
                    flex items-center justify-between gap-3
                    px-3 py-3
                    rounded-xl
                    hover:bg-white/70
                  "
                >
                  <div className="flex items-center gap-4">
                    {/* 排名圓圈 */}
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

                    {/* 名稱 */}
                    <div className="text-lg font-semibold">{it.name}</div>
                  </div>

                  {/* 分數 + 查看解釋 */}
                  <div className="flex items-center gap-3">
                    <ScorePill score={it.score} />
                    <PrimaryButton
                      className="!px-4 !py-2 !text-base"
                      onClick={() =>
                        nav(`/candidate/${it.id}`, {
                          state: {
                            from: location.pathname,
                            brand,
                          } as any,
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

        {/* 右側：視覺化分析（手動排版成置中） */}
        <SectionCard>
          <div
            className="
              flex flex-col
              items-center
              text-center
              gap-6
              h-full
              py-4
            "
          >
            {/* 標題放在卡片內，置中 */}
            <div className="text-2xl font-bold text-[#1e4a57]">
              視覺化分析
            </div>

            {/* 主要操作按鈕群 */}
            <PrimaryButton
              className="
                w-[80%]
                max-w-[320px]
                text-lg
                py-3
                text-white
              "
              onClick={() =>
                alert("TODO: 名人特徵比對視覺化（t-SNE/Plotly）")
              }
            >
              名人特徵比對
            </PrimaryButton>

            <PrimaryButton
              className="
                w-[80%]
                max-w-[320px]
                text-lg
                py-3
                text-white
              "
              onClick={() => alert("TODO: 品牌趨勢分析（群聚/時序）")}
            >
              品牌趨勢分析
            </PrimaryButton>

            <GhostButton
              className="
                w-[80%]
                max-w-[320px]
                text-lg
                py-3
              "
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

/* ------------------------- 單一候選人詳情頁 ------------------------- */
const CandidateDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<CandidateDetailVM | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.getCandidateDetail(id || "");
      if (mounted) setData(res);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!data) {
    return (
      <Page>
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-500">
          載入中⋯
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
            <span>
              Name:{" "}
              <span className="font-bold text-2xl">{data.name}</span>
            </span>
          }
          right={
            <div className="flex items-center gap-3">
              <ScorePill score={data.score} />
              <GhostButton onClick={() => nav(-1)}>回上一頁</GhostButton>
            </div>
          }
        >
          <div className="p-4 border rounded-xl bg-white leading-8">
            {data.persona}
          </div>
        </SectionCard>

        <SectionCard title="推薦原因">
          <ul className="list-disc pl-6 space-y-2">
            {data.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="曾經合作過的品牌">
          <ol className="list-decimal pl-6 grid gap-2">
            {data.pastBrands.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="相似藝人">
          <ol className="list-decimal pl-6 grid gap-2">
            {data.similarArtists.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </Page>
  );
};

/* ------------------------- Analysis 頁（暫留視覺化） ------------------------- */
const Analysis = () => (
  <Page>
    <NavBar />

    <div
      className="
        w-full
        max-w-[1200px]
        mx-auto
        px-4
        py-16
        flex
        justify-center
      "
    >
      {/* 用一層 wrapper div 來做寬度限制 */}
      <div className="w-full md:w-[600px]">
        <SectionCard>
          <div className="flex flex-col items-center text-center gap-8 w-full">
            {/* 標題 */}
            <div className="text-2xl font-bold text-[#1e4a57]">
              視覺化分析
            </div>

            {/* 兩個主按鈕 */}
            <div className="flex flex-col gap-6 w-full max-w-[400px]">
              <PrimaryButton
                className="
                  w-full
                  text-lg
                  py-4
                  text-white
                  rounded-[999px]
                  shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                "
                onClick={() =>
                  alert('TODO: 名人特徵比對（t-SNE 互動圖）')
                }
              >
                名人特徵比對
              </PrimaryButton>

              <PrimaryButton
                className="
                  w-full
                  text-lg
                  py-4
                  text-white
                  rounded-[999px]
                  shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                "
                onClick={() =>
                  alert('TODO: 品牌群聚與產業趨勢視覺化')
                }
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

/* ------------------------- News 頁（爬蟲結果假資料） ------------------------- */
const News = () => (
  <Page>
    <NavBar />
    <div className="max-w-5xl mx-auto px-4 py-10 grid gap-6">
      <SectionCard title="最新消息">
        <p className="text-slate-600">
          這裡可以串接你的排程爬蟲（Scrapy / Celery）輸出，現在展示假資料：
        </p>
        <ul className="mt-4 list-disc pl-6 space-y-2">
          {mockNews.map((n, i) => (
            <li key={i}>
              <span className="font-medium">{n.title}</span> —{" "}
              <span className="text-slate-500">{n.date}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  </Page>
);

/* ------------------------- Root App (路由) ------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/results/:brand" element={<Results />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ------------------------- 型別宣告 ------------------------- */
type Recommendation = { id: string; name: string; score: number };

type CandidateDetailVM = {
  id: string;
  name: string;
  score: number;
  persona: string;
  reasons: string[];
  pastBrands: string[];
  similarArtists: string[];
};

/* ------------------------- Mock Data / 假資料 ------------------------- */
const celebrities = [
  { id: "c1", name: "蔡依林" },
  { id: "c2", name: "周杰倫" },
  { id: "c3", name: "瘦子 E.SO" },
  { id: "c4", name: "小 S" },
  { id: "c5", name: "林書豪" },
  { id: "c6", name: "戴資穎" },
  { id: "c7", name: "孫芸芸" },
  { id: "c8", name: "吳慷仁" },
  { id: "c9", name: "柯佳嬿" },
  { id: "c10", name: "林依晨" },
];

const mockNews = [
  { title: "運動品牌攜手頂尖球星展開形象合作", date: "2025-10-10" },
  { title: "行動外送平台完成多代言人組合策略 A/B 測試", date: "2025-10-12" },
  { title: "筆電品牌釋出新系列形象片，鎖定年輕族群", date: "2025-10-18" },
];

// 穩定產生分數
const seededScore = (brand: string, name: string) => {
  const seed = Array.from(brand + name).reduce(
    (a, c) => a + c.charCodeAt(0),
    0
  );
  // 6.0 ~ 10.0
  return 6 + ((seed % 40) / 40) * 4;
};

/* ------------------------- API (目前是假資料) ------------------------- */
/* 之後你只要把這裡改成真正呼叫後端的 fetch 即可
   例如:
   const res = await fetch(`${baseURL}/recommend?brand=${brand}`)
   return await res.json()
*/
const api = {
  async recommendForBrand(
    brand: string,
    opts: { topK?: number } = {}
  ): Promise<Recommendation[]> {
    const topK = opts.topK ?? 10;
    await wait(200); // 模擬延遲
    const scored = celebrities
      .map((c) => ({
        id: c.id,
        name: c.name,
        score: seededScore(brand, c.name),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return scored;
  },

  async getCandidateDetail(id: string): Promise<CandidateDetailVM> {
    await wait(150); // 模擬延遲
    const celeb = celebrities.find((c) => c.id === id) || celebrities[0];

    const persona =
      "華語樂壇極具影響力的流行天后，以堅強意志與不斷突破的創作精神聞名。她以自信、努力與創新成為許多人心中的榜樣，也持續用音樂與舞台感染世界。";

    const reasons = [
      "品牌主打專業可靠（Competence），其形象與藝人專注、穩定特質高度契合",
      "社群與年輕族群滲透率高，能放大品牌話題",
      "過去跨界合作多元，與科技/時尚品牌調性相容",
    ];

    const pastBrands = ["HP ENVY", "快時尚品牌 A", "飲料品牌 B"];
    const similarArtists = ["張惠妹", "田馥甄", "楊丞琳"];

    return {
      id: celeb.id,
      name: celeb.name,
      score: seededScore("brand", celeb.name),
      persona,
      reasons,
      pastBrands,
      similarArtists,
    };
  },
};

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}