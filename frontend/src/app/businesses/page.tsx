"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Business = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  telegram: string | null;
  whatsapp: string | null;
  hours: string | null;
  isVerified: boolean;
  category: { name: string };
  region: { name: string };
  city: { name: string };
};

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/businesses")
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data);
        setLoading(false);
      });
  }, []);

  const filtered = businesses.filter((b) =>
    (b.name + b.category.name + b.city.name)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 font-sans dark:bg-black">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Browse Businesses
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {businesses.length} verified listing{businesses.length !== 1 && "s"}
          </p>
        </div>

        <input
          className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Search by name, category, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">
            No businesses found.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map((b) => {
            const telHref = b.phone ? "tel:" + b.phone : null;
            const waHref = b.whatsapp
              ? "https://wa.me/" + b.whatsapp.replace(/\D/g, "")
              : null;
            const tgHref = b.telegram
              ? "https://t.me/" + b.telegram.replace("@", "")
              : null;
            const locationLine = b.category.name + " - " + b.city.name + ", " + b.region.name;

            return (
              <div
                key={b.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {b.name}
                  </h2>
                  {b.isVerified && (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {locationLine}
                </p>

                {b.description && (
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {b.description}
                  </p>
                )}

                {b.address && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Address: {b.address}
                  </p>
                )}

                {b.hours && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Hours: {b.hours}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {telHref && (
                    <Link
                      href={telHref}
                      className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                    >
                      Call
                    </Link>
                  )}
                  {waHref && (
                    <Link
                      href={waHref}
                      target="_blank"
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      WhatsApp
                    </Link>
                  )}
                  {tgHref && (
                    <Link
                      href={tgHref}
                      target="_blank"
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      Telegram
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}