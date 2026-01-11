import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xCol, setXCol] = useState("");
  const [yCols, setYCols] = useState([]);
  const [chartType, setChartType] = useState("line");

  /* ---------------- DARK MODE ---------------- */
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      if (!json.length) return;

      setData(json);
      setHeaders(Object.keys(json[0]));
      setXCol(Object.keys(json[0])[0]);
      setYCols([]);
    };
    reader.readAsBinaryString(file);
  };

  const numericColumns = headers.filter((h) =>
    data.every((row) => !isNaN(Number(row[h])))
  );

  const toggleY = (col) => {
    setYCols((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Excel Analytics
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Upload Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-medium mb-1">
            Upload your spreadsheet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            XLSX or CSV files supported
          </p>

          {/* Premium Upload Button */}
          <label className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer shadow-lg transition">
            📂 Upload File
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </section>

        {data.length === 0 && (
          <div className="text-center text-slate-400 py-24">
            Upload a file to start visualizing your data
          </div>
        )}

        {data.length > 0 && (
          <>
            {/* Controls */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="X Axis">
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1"
                  value={xCol}
                  onChange={(e) => setXCol(e.target.value)}
                >
                  {headers.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </Card>

              <Card title="Y Axis (Numeric)">
                <div className="flex flex-wrap gap-3">
                  {numericColumns.map((col) => (
                    <label key={col} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={yCols.includes(col)}
                        onChange={() => toggleY(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </Card>

              <Card title="Chart Type">
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                </select>
              </Card>
            </section>

            {/* Chart */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 h-[450px]">
              {xCol && yCols.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={data}>
                      <XAxis dataKey={xCol} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {yCols.map((col) => (
                        <Line key={col} dataKey={col} strokeWidth={2} />
                      ))}
                    </LineChart>
                  ) : (
                    <BarChart data={data}>
                      <XAxis dataKey={xCol} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {yCols.map((col) => (
                        <Bar key={col} dataKey={col} />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Select X and Y axes to render chart
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Excel Analytics. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */
function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
