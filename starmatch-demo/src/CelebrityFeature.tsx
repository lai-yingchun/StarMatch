import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Page, SectionCard, PrimaryButton, NavBar } from "./App";

type TSNEPoint = {
  artist: string;
  job: string;
  x: number;
  y: number;
  persona?: string;
};

const CelebrityFeature: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [tsneData, setTsneData] = useState<TSNEPoint[]>([]);

  // ⬇️ 讀取你輸出的 JSON
  useEffect(() => {
    fetch("/src/data/celeb_tsne.json")
      .then((res) => res.json())
      .then((data) => {
        setTsneData(data);
      });
  }, []);

  useEffect(() => {
    if (tsneData.length === 0) return;

    const width = 1100;
    const height = 600;
    const margin = 100;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([[0, 0], [width - margin, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom as any);

    // X / Y scale
    const xScale = d3.scaleLinear()
      .domain(d3.extent(tsneData, (d) => d.x) as [number, number])
      .range([margin, width - margin * 2]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(tsneData, (d) => d.y) as [number, number])
      .range([height - margin, margin]);

    // Tooltip setup
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // 群組顏色
    const job = Array.from(new Set(tsneData.map(d => d.job)));
    const colorScale = d3.scaleOrdinal()
      .domain(job)
      .range(d3.schemeTableau10);

    // Points
    g.selectAll("circle")
      .data(tsneData)
      .join("circle")
      .attr("cx", (d) => Math.round(xScale(d.x)))
      .attr("cy", (d) => Math.round(yScale(d.y)))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d.job) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mouseenter", (event, d) => {
        tooltip.html(`
          <strong>${d.artist}</strong><br/>
          職業: ${d.job}<br/>
          Persona: ${d.persona ? d.persona: "暫無資料"}
        `).style("opacity", 1);
      })
      .on("mousemove", (event) => {
        const cardRect = cardRef.current!.getBoundingClientRect();
        tooltip.style("left", `${event.clientX - cardRect.left + 10}px`)
               .style("top", `${event.clientY - cardRect.top + 10}px`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));

    // Display artists
    g.selectAll("text.artist")
      .data(tsneData)
      .join("text")
      .attr("x", (d) => Math.round(xScale(d.x)) + 10)
      .attr("y", (d) => Math.round(yScale(d.y)))
      .text((d) => d.artist)
      .style("font-size", "11px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    // Axis
    g.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(d3.axisBottom(xScale).ticks(10));

    g.append("g")
      .attr("transform", `translate(${margin},0)`)

      .call(d3.axisLeft(yScale).ticks(10));

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin + 20}, ${margin})`);

    job.forEach((t, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
      row.append("rect").attr("width", 18).attr("height", 18).attr("fill", colorScale(t) as string);
      row.append("text").attr("x", 24).attr("y", 14).text(t).style("font-size", "13px").style("fill", "#333");
    });

  }, [tsneData]);

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