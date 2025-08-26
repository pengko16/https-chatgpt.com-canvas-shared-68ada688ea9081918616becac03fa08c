import React, { useState } from "react";

// Single-file React component for a simple 'web kost' listing
// TailwindCSS utility classes are used throughout (no imports required here)
// Usage: drop into a React app (e.g. Vite / Create React App / Next.js) as src/App.jsx

// NOTE:
// This file was rewritten to fix a runtime/build error caused by an accidental
// legacy octal literal usage in the WA link interpolation. The fix is to
// ALWAYS treat phone numbers as strings and normalize them before building
// a `https://wa.me/...` URL.

const SAMPLE_KOSTS = [
  {
    id: 1,
    title: "Kost NAINAS",
    price: 750000,
    roomType: "Kamar mandi dalam",
    image: "https://rajawali47timur-kcdpr.wordpress.com/wp-content/uploads/2025/08/background.png",
    facilities: ["Wifi", "Kamar mandi dalam", "Kulkas bersama", "Dapur bersama"],
    description: "Kost khusus putri, lingkungan aman.",
    contact: "62082315652505",
    
  },
  {
    id: 2,
    title: "Kost NAINAS",
    price: 650000,
    roomType: "Kamar mandi bersama",
    image: "https://rajawali47timur-kcdpr.wordpress.com/wp-content/uploads/2025/08/img-20250411-wa0005.jpg",
    facilities: ["Wifi", "Kamar mandi bersama", "Kulkas bersama", "Dapur Bersama"],
    description: "Kost khusus putri, lingkungan aman.",
    contact: "62082315652505",
    
  },
  {
    id: 3,
    title: "Kost NAINAS",
    price: 600000,
    roomType: "Kamar mandi bersama",
    image: "https://rajawali47timur-kcdpr.wordpress.com/wp-content/uploads/2025/08/chatgpt-image-apr-10-2025-05_44_30-pm.png",
    facilities: ["Wifi", "Kamar mandi bersama", "Kulkas bersama", "Dapur Bersama"],
    description: "Kost khusus putri, lingkungan aman.",
    contact: "62082315652505",
    
   
  },
];

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
}

// Normalize phone number so it works with https://wa.me/<number>
// Rules applied (sane defaults for Indonesian numbers):
// - accept strings like "082315652505", "+6282315652505", "82315652505"
// - remove all non-digits
// - if it starts with '0' -> replace with '62'
// - if it starts with '8' (local without leading 0) -> prefix '62'
// - if it already starts with '62' -> keep as-is
// - return null if normalization fails
function normalizePhoneForWhatsApp(phone) {
  if (!phone && phone !== 0) return null;
  const s = String(phone).trim();
  if (s.length === 0) return null;
  // remove non-digit characters (plus signs, spaces, parentheses, dashes)
  const digits = s.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  if (digits.startsWith("8")) {
    // common case: user typed '8231...' without leading 0
    return "62" + digits;
  }
  // fallback: return digits (may be international format without +)
  return digits;
}

function getWaLink(phone) {
  const normalized = normalizePhoneForWhatsApp(phone);
  return normalized ? `https://wa.me/${normalized}` : null;
}

function Header({ onOpenAdd }) {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-indigo-400 text-white p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kost NAINAS (Khusus Putri)</h1>
          <p className="text-sm opacity-90">Cari & pasang iklan kost dengan mudah</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdd}
            className="bg-white text-indigo-600 px-4 py-2 rounded-md shadow-sm font-medium hover:shadow-lg"
          >
            Pasang Iklan
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ query, setQuery, area, setArea }) {
  return (
    <div className="max-w-6xl mx-auto -mt-6 p-4">
      <div className="bg-white shadow-md rounded-lg p-4 flex gap-3 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kost, lokasi, fasilitas..."
          className="flex-1 p-3 rounded-md border focus:outline-none"
        />
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="p-3 rounded-md border"
        >
          <option value="">Semua Lokasi</option>
          <option value="Jakarta Selatan">Jakarta Selatan</option>
          <option value="Depok">Depok</option>
          <option value="Bandung">Bandung</option>
        </select>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Cari</button>
      </div>
    </div>
  );
}

function KostCard({ k, onOpen }) {
  const area = k.area || "-";
  const size = k.size || "-";
  const facilitiesText = (k.facilities && k.facilities.length) ? k.facilities.join(", ") : "-";
  const beds = k.beds ?? "-";
  const baths = k.baths ?? "-";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img src={k.image} alt={k.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{k.title}</h3>
            <p className="text-sm text-gray-500">{area} • {k.roomType}</p>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatRupiah(k.price)}/bln</div>
            <div className="text-xs text-gray-500">{size}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-700">{k.description}</p>
        <div className="mt-2 text-xs text-gray-600">Fasilitas: {facilitiesText}</div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">{beds} Bed • {baths} Bath</div>
          <div className="flex gap-2">
            <button
              onClick={() => onOpen(k)}
              className="px-3 py-1 rounded-md border text-sm"
            >
              Lihat
            </button>
            <button className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">Booking</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const waLink = getWaLink(item.contact);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full rounded-lg overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="p-4">
            <img src={item.image} alt="detail" className="w-full h-64 object-cover rounded" />
            <div className="mt-4">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.area || '-'} • {item.roomType}</p>
              <div className="mt-2 text-indigo-600 font-semibold">{formatRupiah(item.price)}/bulan</div>
              <div className="mt-2 text-sm">Kontak Pemilik: <span className="font-medium">{item.contact || '-'}</span></div>
            </div>
          </div>
          <div className="p-4 border-l">
            <h3 className="font-semibold">Deskripsi</h3>
            <p className="text-sm text-gray-700 mt-2">{item.description}</p>
            <div className="mt-4">
              <div className="text-sm text-gray-600">Fasilitas</div>
              <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                {(item.facilities || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex gap-2">
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-indigo-600 text-white">Hubungi Pemilik</a>
              ) : (
                <button disabled className="px-4 py-2 rounded-md border opacity-50">Kontak tidak tersedia</button>
              )}
              <button onClick={onClose} className="px-4 py-2 rounded-md border">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddListingForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: "", price: "", area: "", description: "", image: "", facilities: "", contact: "" });
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-lg overflow-hidden shadow-lg p-6">
        <h3 className="text-lg font-semibold">Pasang Iklan Kost</h3>
        <div className="mt-4 grid gap-3">
          <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Judul" className="p-3 rounded border" />
          <input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="Harga per bulan (angka)" className="p-3 rounded border" />
          <input value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})} placeholder="Lokasi" className="p-3 rounded border" />
          <input value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})} placeholder="URL gambar (opsional)" className="p-3 rounded border" />
          <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Deskripsi singkat" className="p-3 rounded border" />
          <input value={form.facilities} onChange={(e)=>setForm({...form,facilities:e.target.value})} placeholder="Fasilitas (pisahkan dengan koma)" className="p-3 rounded border" />
          <input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} placeholder="Nomor Kontak Pemilik (WhatsApp)" className="p-3 rounded border" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
          <button onClick={() => {
            const newKost = {
              ...form,
              id: Date.now(),
              price: Number(form.price) || 0,
              roomType: form.roomType || "-",
              beds: 1,
              baths: 1,
              size: form.size || "-",
              image: form.image || "https://picsum.photos/seed/new/800/600",
              facilities: form.facilities ? form.facilities.split(",").map(f=>f.trim()) : [],
              contact: String(form.contact || "").trim(),
            };
            onAdd(newKost);
          }} className="px-4 py-2 rounded bg-indigo-600 text-white">Pasang</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [kosts, setKosts] = useState(SAMPLE_KOSTS);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = kosts.filter((k) => {
    const facilitiesText = (k.facilities || []).join(" ");
    const matchesQuery = (k.title + " " + (k.description || "") + " " + (k.area || "") + " " + facilitiesText).toLowerCase().includes(query.toLowerCase());
    const matchesArea = area ? k.area === area : true;
    return matchesQuery && matchesArea;
  });

  const handleAdd = (newKost) => {
    setKosts((s) => [newKost, ...s]);
    setShowAdd(false);
  };

  // Small dev-time tests for phone normalization (runs in browser console)
  if (typeof window !== 'undefined') {
    // These logs help during development to ensure WA links are generated properly
    // Remove these logs in production if you prefer.
    // eslint-disable-next-line no-console
    console.log('+6282315652505:', {
      "082315652505": normalizePhoneForWhatsApp('082315652505'),
      "+6282315652505": normalizePhoneForWhatsApp('+6282315652505'),
      "82315652505": normalizePhoneForWhatsApp('82315652505'),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenAdd={() => setShowAdd(true)} />

      <main className="py-8">
        <SearchBar query={query} setQuery={setQuery} area={area} setArea={setArea} />

        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hasil Pencarian</h2>
            <div className="text-sm text-gray-600">Menampilkan {filtered.length} hasil</div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map((k) => (
              <KostCard key={k.id} k={k} onOpen={setSelected} />
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t p-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Kost NAINAS — dibuat oleh Pengko
        </div>
      </footer>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddListingForm onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
