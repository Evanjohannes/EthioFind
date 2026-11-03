"use client";

import { useEffect, useState } from "react";

type City = {
  id: number;
  name: string;
};

type Region = {
  id: number;
  name: string;
  cities: City[];
};

export default function Home() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/regions")
      .then((res) => res.json())
      .then((data: Region[]) => setRegions(data))
      .catch(() => setError("Could not reach the backend"));
  }, []);

  const selectedRegion = regions.find(
    (r) => r.id === Number(selectedRegionId)
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          EthioFind
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Find local businesses & services near you
        </p>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex w-full flex-col gap-4 text-left">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Region
            </label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value);
                setSelectedCityId("");
              }}
            >
              <option value="">
                {regions.length === 0 ? "Loading regions..." : "Select a region"}
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              City
            </label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              disabled={!selectedRegion}
            >
              <option value="">
                {selectedRegion ? "Select a city" : "Select a region first"}
              </option>
              {selectedRegion?.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRegion && selectedCityId && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Searching in{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {selectedRegion.cities.find((c) => c.id === Number(selectedCityId))?.name}
              , {selectedRegion.name}
            </span>
          </p>
        )}
      </main>
    </div>
  );
}