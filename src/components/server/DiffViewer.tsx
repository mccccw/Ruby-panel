"use client";

import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-base";
import "diff2html/bundles/css/diff2html.min.css";
import { useEffect, useRef } from "react";

export function DiffViewer({ diff }: { diff: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.innerHTML = "";
    const ui = new Diff2HtmlUI(ref.current, diff, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "side-by-side"
    });
    ui.draw();
  }, [diff]);
  return <div className="overflow-auto rounded-xl border border-white/10 bg-white text-black" ref={ref} />;
}
