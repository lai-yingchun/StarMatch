import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Page, SectionCard, PrimaryButton, NavBar } from "./App"; // 路徑依專案調整

type TSNEPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  persona: string;
  type: string;
};

const mockTSNEData: TSNEPoint[] = [
  { id: "a1", name: "藝人A", x: 14, y: 16, score: 9.2, persona: "熱血又有活力，擅長現場表演", type: "歌手" },
  { id: "a2", name: "藝人B", x: 16, y: 13, score: 8.5, persona: "穩重有實力，專注於音樂創作", type: "歌手" },
  { id: "a3", name: "藝人C", x: 15, y: 18, score: 7.8, persona: "流量型藝人，粉絲互動高", type: "歌手" },
  { id: "a10", name: "藝人J", x: 17, y: 12, score: 8.1, persona: "綜藝咖，娛樂感十足", type: "歌手" },

  { id: "a5", name: "藝人E", x: 13, y: 11, score: 7.5, persona: "搞笑藝人，綜藝感強", type: "演員" },
  { id: "a6", name: "藝人F", x: 11, y: 14, score: 8.2, persona: "才子型，創作能力佳", type: "演員" },
  { id: "a8", name: "藝人H", x: 12, y: 16, score: 8.6, persona: "實力派演員，表演扎實", type: "演員" },

  { id: "a7", name: "藝人G", x: 16, y: 15, score: 7.9, persona: "潮流型藝人，形象時尚", type: "模特" },
  { id: "a9", name: "藝人I", x: 15, y: 14, score: 7.7, persona: "文青型藝人，形象獨特", type: "模特" },
  { id: "a14", name: "藝人N", x: 14, y: 12, score: 7.8, persona: "專注於舞蹈表演，動作標準", type: "模特" },

  { id: "a13", name: "藝人M", x: 15, y: 17, score: 7.6, persona: "啦啦隊隊長，氣氛帶動力強", type: "啦啦隊" },
];

const CelebrityFeature: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const width = 1100;
    const height = 600;
    const margin = 100; // 左右上下空間，右側留給 Legend

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom + 平移限制
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([[0, 0], [width - margin, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom as any);

    // X / Y scale
    const xScale = d3.scaleLinear()
      .domain(d3.extent(mockTSNEData, (d) => d.x) as [number, number])
      .range([margin, width - margin * 2]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(mockTSNEData, (d) => d.y) as [number, number])
      .range([height - margin, margin]);

    // Tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // type 顏色
    const types = Array.from(new Set(mockTSNEData.map(d => d.type)));
    const colorScale = d3.scaleOrdinal()
      .domain(types)
      .range(d3.schemeTableau10);

    // 畫點
    g.selectAll("circle")
      .data(mockTSNEData)
      .join("circle")
      .attr("cx", (d) => Math.round(xScale(d.x)))
      .attr("cy", (d) => Math.round(yScale(d.y)))
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d.type) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseenter", (event, d) => {
        tooltip
          .html(`
            <strong>${d.name}</strong><br/>
            分數: ${d.score.toFixed(1)}<br/>
            人設: ${d.persona}<br/>
            類型: ${d.type}<br/>
            座標: (${Math.round(d.x)}, ${Math.round(d.y)})
          `)
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        if (!cardRef.current) return;
        const cardRect = cardRef.current.getBoundingClientRect();
        const tooltipEl = tooltipRef.current!;
        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;

        let left = event.clientX - cardRect.left + 10;
        let top = event.clientY - cardRect.top + 10;

        if (left + tooltipWidth > cardRect.width) left = event.clientX - cardRect.left - tooltipWidth - 10;
        if (top + tooltipHeight > cardRect.height) top = event.clientY - cardRect.top - tooltipHeight - 10;

        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    // 永遠顯示藝人名字
    g.selectAll("text.name")
      .data(mockTSNEData)
      .join("text")
      .attr("class", "name")
      .attr("x", (d) => Math.round(xScale(d.x)) + 12)
      .attr("y", (d) => Math.round(yScale(d.y)))
      .attr("dy", "0.35em")
      .text((d) => d.name)
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d"));

    g.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(xAxis);

    g.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(yAxis);

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin + 20}, ${margin})`);

    types.forEach((t, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 30})`);

      legendRow.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", colorScale(t) as string);

      legendRow.append("text")
        .attr("x", 28)
        .attr("y", 0)
        .attr("dy", "1em")
        .text(t)
        .style("font-size", "14px")
        .style("fill", "#333");
    });

  }, []);

  return (
    <Page>
      <NavBar />
      <div className="max-w-8xl mx-auto px-4 py-16">
        <SectionCard title="名人特徵比對 (t-SNE 互動圖)">
          <div className="relative" ref={cardRef}>
            <svg ref={svgRef} width={1100} height={600} className="border" />
            <div ref={tooltipRef}></div>
          </div>
          <PrimaryButton onClick={() => window.history.back()} className="mt-4">
            回上一頁
          </PrimaryButton>
        </SectionCard>
      </div>
    </Page>
  );
};

export default CelebrityFeature;
