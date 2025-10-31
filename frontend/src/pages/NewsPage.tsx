import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";

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

export default function NewsPage() {
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
}