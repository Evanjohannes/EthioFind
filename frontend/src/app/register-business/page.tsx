"use client";

import { useEffect, useState } from "react";

type City = { id: number; name: string };
type Region = { id: number; name: string; cities: City[] };
type Category = { id: number; name: string };

export default function RegisterBusiness() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [hours, setHours] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/regions")
      .then((res) => res.json())
      .then(setRegions);

    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const selectedRegion = regions.find((r) => r.id === Number(regionId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:4000/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: Number(categoryId),
          regionId: Number(regionId),
          cityId: Number(cityId),
          description,
          address,
          phone,
          telegram,
          whatsapp,
          website,
          hours,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setResult("success");
      setName("");
      setCategoryId("");
      setRegionId("");
      setCityId("");
      setDescription("");
      setAddress("");
      setPhone("");
      setTelegram("");
      setWhatsapp("");
      setWebsite("");
      setHours("");
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
  const labelClass =
    "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Register Your Business
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Get discovered by customers near you
          </p>
        </div>

        {result === "success" && (
          <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Business submitted! It will appear once approved by an admin.
          </div>
        )}
        {result === "error" && (
          <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Something went wrong. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Business Name *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Region *</label>
              <select
                className={inputClass}
                value={regionId}
                onChange={(e) => {
                  setRegionId(e.target.value);
                  setCityId("");
                }}
                required
              >
                <option value="">Select region</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>City *</label>
              <select
                className={inputClass}
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!selectedRegion}
                required
              >
                <option value="">
                  {selectedRegion ? "Select city" : "Pick region first"}
                </option>
                {selectedRegion?.cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Hours</label>
              <input
                className={inputClass}
                placeholder="e.g. Mon-Sat 9am-6pm"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telegram</label>
              <input
                className={inputClass}
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                className={inputClass}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              className={inputClass}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-zinc-900 px-5 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {submitting ? "Submitting..." : "Register Business"}
          </button>
        </form>
      </main>
    </div>
  );
}