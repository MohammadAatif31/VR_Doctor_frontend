/* eslint-disable no-unused-vars */
import { useEffect, useState} from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

import { Pie, Line } from "react-chartjs-2";
import { FiArrowLeft } from "react-icons/fi";

import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [visible, setVisible] = useState(5);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [hospitals, setHospitals] = useState([]);

 const fetchHistory = async () => {
  try {
    const res = await API.get("/health/history");
    setHistory(res.data);
  } catch (err) {
    console.log(err);
  }
};
 // eslint-disable-next-line react-hooks/exhaustive-deps 
useEffect(() => {
  window.scrollTo(0,0)

  fetchHistory();
}, []);

  // HEALTH SCORE

  let score = 100;

  history.forEach((log) => {
    if (log.severity?.toLowerCase() === "medium") score -= 5;
    if (log.severity?.toLowerCase() === "high") score -= 10;
  });

  if (score < 0) score = 0;

  //---animation--//

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += 1;

      setAnimatedScore(start);

      if (start >= score) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [score]);

  // SEVERITY COUNT

  const severityCount = {
    Low: history.filter((h) => h.severity?.toLowerCase() === "low").length,
    Medium: history.filter((h) => h.severity?.toLowerCase() === "medium")
      .length,
    High: history.filter((h) => h.severity?.toLowerCase() === "high").length,
  };

  const pieData = {
    labels: ["Low", "Medium", "High"],

    datasets: [
      {
        data: [severityCount.Low, severityCount.Medium, severityCount.High],

        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
      },
    ],
  };

  const last = history[0];

  // AI DISEASE PREDICTION

  let diseasePrediction = last?.disease
    ? `${last.disease} (${last.confidence || 60}%)`
    : "No risk detected";

  //--doctor recommendation--//

  let doctor = last?.doctor || "General Physician";

  // ================================
  // AI HEALTH INSIGHTS SYSTEM
  // ================================

  let aiInsights = [];
  let riskLevel = last?.severity?.toLowerCase() || "low";
  riskLevel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  let advice = last?.advice || "Maintain healthy lifestyle.";

  if (last) {
    // severity directly from database (JSON or Gemini)
    riskLevel = last.severity
      ? last.severity.charAt(0).toUpperCase() + last.severity.slice(1)
      : "Low";

    // advice from AI or JSON
    advice = last.advice || "Maintain healthy lifestyle.";

    // AI insights message
    aiInsights.push(`Detected condition: ${last.disease || "Unknown"}`);
  }

  if (aiInsights.length === 0) {
    aiInsights.push("Your health logs show stable condition.");
  }

  // -----------------------------
  // AI DISEASE PROBABILITY
  // -----------------------------
  let diseaseProbability = {
    Flu: 0,
    Cold: 0,
    Respiratory: 0,
  };

  history.forEach((log) => {
    const disease = log.disease?.toLowerCase() || "";
    const confidence = log.confidence || 0;

    if (disease.includes("flu") || disease.includes("fever"))
      diseaseProbability.Flu = Math.max(diseaseProbability.Flu, confidence);

    if (disease.includes("cold") || disease.includes("cough"))
      diseaseProbability.Cold = Math.max(diseaseProbability.Cold, confidence);

    if (disease.includes("respiratory") || disease.includes("chest"))
      diseaseProbability.Respiratory = Math.max(
        diseaseProbability.Respiratory,
        confidence,
      );
  });

// loction doctor//

let doctorType = "General Physician";

const disease = last?.disease?.toLowerCase() || "";

if (disease.includes("heart")) doctorType = "Cardiologist";

else if (disease.includes("skin")) doctorType = "Dermatologist";

else if (disease.includes("respiratory") || disease.includes("asthma"))
  doctorType = "Pulmonologist";

else if (disease.includes("fever") || disease.includes("flu"))
  doctorType = "General Physician";

else if (disease.includes("brain") || disease.includes("migraine"))
  doctorType = "Neurologist";

  // location -finder//
 useEffect(() => {

  const cached = localStorage.getItem("nearbyHospitals");

  // if cache exists show instantly
  if (cached) {
    setHospitals(JSON.parse(cached));
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try {

      const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000,${lat},${lon});
      );
      out;
      `;

      const res = await fetch(
        "https://overpass.kumi.systems/api/interpreter",
        {
          method: "POST",
          body: query
        }
      );

      const data = await res.json();

      const hospitalsData = data.elements
        .slice(0,5)
        .map(h => ({
          name: h.tags?.name || "Nearby Hospital"
        }));

      setHospitals(hospitalsData);

      // save cache
      localStorage.setItem(
        "nearbyHospitals",
        JSON.stringify(hospitalsData)
      );

    } catch (err) {

      console.log("Hospital API Error", err);

    }

  });

}, []);
  
  return (
  <div className="min-h-screen bg-[#0d0d0d] text-white">

    {/* HEADER */}
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md rounded-b-3xl">

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between py-3">

        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
        >
          <FiArrowLeft size={22} />
        </button>

        <h1 className="text-xl md:text-2xl py-2 px-4 rounded-2xl border border-gray-600 font-semibold">
          🩺VR Doctor
        </h1>

      </div>

    </div>


    {/* MAIN CONTENT */}

    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-6 space-y-6">

      {/* TOP CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden">
          <h3 className="text-sm text-gray-400">Health Score</h3>

          {/* glowing background */}

          <div className="absolute w-40 h-40 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>

          <div className="relative w-28 h-28 mt-2">
            <svg className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="healthGradient">
                  <stop offset="0%" stopColor="#22c55e" />

                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>

              {/* background circle */}

              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="#1f2937"
                strokeWidth="10"
                fill="none"
              />

              {/* progress circle */}

              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="url(#healthGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * animatedScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            {/* animated percentage */}

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-green-400 text-xl font-bold animate-bounce">
                {animatedScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl text-center p-5">
          <h3 className="text-gray-400 text-sm">Total Logs</h3>

          <p className="text-2xl mt-3 font-bold">{history.length}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5">
          <h3 className="text-gray-400 text-sm">AI Prediction</h3>

          <p className="mt-3">{diseasePrediction}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5">
          <h3 className="text-gray-400 text-sm">Risk Meter</h3>

          <p className="mt-3">
            {riskLevel === "Low" && "Low Risk 🟢"}
            {riskLevel === "Medium" && "Medium Risk 🟡"}
            {riskLevel === "High" && "High Risk 🔴"}
          </p>
        </div>
      </div>

      {/* SEVERITY + TREND */}

      <div className="grid md:grid-cols-2 gap-6 items-stretch ">
        <div className="bg-gray-900 rounded-2xl p-6  flex flex-col ">
          <h2 className="mb-4 text-lg font-semibold">Severity Distribution</h2>
          <div className="flex-1 flex  items-center justify-center">
            <Pie data={pieData} />
          </div>
        </div>

        {/* SYMPTOM FREQUENCY */}

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Symptom Frequency</h2>

          <Line
            data={{
              labels: history.map((h) => new Date(h.date).toLocaleDateString()),
              datasets: [
                {
                  label: "Symptom Frequency",
                  data: history.map((h) => h.confidence || 1),
                  borderColor: "#22c55e",
                  backgroundColor: "#22c55e33",
                  tension: 0.4,
                },
              ],
            }}
          />
        </div>
      </div>

      {/* DOCTOR ROW */}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Recommended Doctor</h2>

          <p className="text-blue-400 text-lg">{doctor}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Nearby Doctors</h2>

        {hospitals.length === 0 ? (
  <p className="text-gray-400 text-sm">Finding nearby hospitals...</p>
) : (
  hospitals.map((doc, i) => (
    <p key={i} className="text-sm">
      {doc.name} • {doctor}
    </p>
  ))
)}
        </div>
      </div>

      {/* AI HEALTH INSIGHTS */}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">AI Health Insights</h2>

        <div className="space-y-3 text-sm text-gray-300">
          {aiInsights.map((tip, index) => (
            <p key={index}>🧠 {tip}</p>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-800 pt-3 text-sm">
          <p>
            ⚠️ Risk Level :
            <span className="ml-2 font-semibold">
              {riskLevel === "Low" && "Low Risk 🟢"}
              {riskLevel === "Medium" && "Medium Risk 🟡"}
              {riskLevel === "High" && "High Risk 🔴"}
            </span>
          </p>

          <p className="mt-2">💡 Advice : {advice}</p>
        </div>
      </div>

      {/* DISEASE PROBABILITY */}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">AI Disease Probability</h2>

        <div className="space-y-3">
          <p>Flu : {diseaseProbability.Flu}%</p>

          <div className="w-full bg-gray-800 h-2 rounded">
            <div
              className="bg-red-500 h-2 rounded"
              style={{ width: `${diseaseProbability.Flu}%` }}
            ></div>
          </div>

          <p>Cold : {diseaseProbability.Cold}%</p>

          <div className="w-full bg-gray-800 h-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${diseaseProbability.Cold}%` }}
            ></div>
          </div>

          <p>Respiratory : {diseaseProbability.Respiratory}%</p>

          <div className="w-full bg-gray-800 h-2 rounded">
            <div
              className="bg-yellow-500 h-2 rounded"
              style={{ width: `${diseaseProbability.Respiratory}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* HEALTH IMPROVEMENT TRACKER */}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Health Improvement Tracker</h2>

        <div className="w-full bg-gray-800 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-400 mt-2">
          {score > 80 && "Your health is improving 📈"}

          {score <= 80 && score > 50 && "Health stable ⚖️"}

          {score <= 50 && "Health declining ⚠️"}
        </p>
      </div>

      {/* TIMELINE */}

      <div className="bg-gray-900 p-6 rounded-2xl">
        <h2 className="mb-4 font-semibold">Symptom Timeline</h2>

        <div className="space-y-3">
          {history.slice(0, visible).map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b border-gray-800 pb-2"
            >
              <div>
                <p>{item.symptoms}</p>
                <span
                  className={
                    item.severity?.toLowerCase() === "high"
                      ? "text-red-400 text-xs"
                      : item.severity?.toLowerCase() === "medium"
                        ? "text-yellow-400 text-xs"
                        : "text-green-400 text-xs"
                  }
                >
                  {item.severity}
                </span>
              </div>

              <span className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          {visible < history.length && (
            <button
              onClick={() => setVisible((v) => v + 10)}
              className="text-blue-400 hover:underline"
            >
              More
            </button>
          )}

          {visible > 5 && (
            <button
              onClick={() => setVisible(5)}
              className="text-gray-400 hover:underline"
            >
              Less
            </button>
          )}
        </div>
      </div>

      {/* HEATMAP */}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="mb-4">Symptom Heatmap</h2>

        <div className="w-full mx-5 overflow-x-auto">
          <div className=" scale-80 md:scale-70 lg:scale-75 origin-left">
            <CalendarHeatmap
              startDate={new Date("2026-01-01")}
              endDate={new Date()}
              values={history.map((item) => ({
                date: item.date,
                count: 1,
              }))}
            />
          </div>
        </div>
      </div>

      {/* CALENDAR */}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="mb-4">Health Calendar</h2>

        <Calendar className={"rounded-3xl text-blue-500"} />
      </div>
    </div>
    </div>
  );
}
