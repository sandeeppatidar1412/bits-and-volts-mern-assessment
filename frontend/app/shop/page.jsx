"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, productImage } from "../../lib/api";

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("search") || "");
      setSort(params.get("sort") || "newest");
      setPage(Math.max(1, Number(params.get("page") || 1)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort, page: String(page), limit: "12" });
        if (search.trim()) params.set("search", search.trim());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        const data = await api(`/products?${params}`);
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [page, pathname, router, search, sort]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api("/wishlist").then((items) => setWishlist(items.map((item) => item.product?._id || item.product))).catch(() => {});
  }, []);

  const add = async (id) => {
    try {
      await api("/cart", { method: "POST", body: JSON.stringify({ productId: id, quantity: 1 }) });
      router.push("/cart");
    } catch (err) {
      if (err.message.includes("Authentication")) router.push("/login");
      else setError(err.message);
    }
  };

  const toggleWishlist = async (id) => {
    if (!localStorage.getItem("token")) return router.push("/login");
    const saved = wishlist.includes(id);
    try {
      await api(`/wishlist${saved ? `/${id}` : ""}`, { method: saved ? "DELETE" : "POST", ...(saved ? {} : { body: JSON.stringify({ productId: id }) }) });
      setWishlist((items) => saved ? items.filter((item) => item !== id) : [...items, id]);
    } catch (err) { setError(err.message); }
  };

  const reset = () => { setSearch(""); setSort("newest"); setPage(1); };
  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
    <div className="mb-8 min-w-0">
      <p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-600">Store</p>
      <h1 className="mt-2 text-4xl font-bold">Shop all products</h1>
      <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1"><span className="sr-only">Search products</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search snacks, pickles, sweets..." className="h-12 min-w-0 rounded-full bg-white px-4" /></label>
        <label className="relative block w-full shrink-0 sm:w-48"><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort products" className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="newest">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating-desc">Best rated</option></select><span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-slate-500" /></label>
        {(search || sort !== "newest") && <button type="button" onClick={reset} className="h-12 shrink-0 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">Reset</button>}
      </div>
    </div>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-16 text-slate-600">Loading products...</p> : products.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center"><p className="text-xl font-semibold">No products found</p><p className="mt-2 text-slate-600">Try another spelling or clear your search.</p><button type="button" onClick={reset} className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white">Clear search</button></div> : <><div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article key={product._id} className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><div className="relative"><Link href={`/shop/${product._id}`}><img src={productImage(product)} onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }} alt={product.name} className="aspect-square w-full object-cover" /></Link><button type="button" onClick={() => toggleWishlist(product._id)} aria-label={wishlist.includes(product._id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-sm">{wishlist.includes(product._id) ? "♥" : "♡"}</button></div><div className="p-5"><p className="truncate text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category?.name || "Food"}</p><h2 className="mt-2 truncate text-lg font-bold">{product.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-600">{product.shortDescription || product.description}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="font-bold">₹{product.price}</span><button type="button" onClick={() => add(product._id)} disabled={!product.stock} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">{product.stock ? "Add to cart" : "Out of stock"}</button></div></div></article>)}</div>{totalPages > 1 && <nav aria-label="Product pages" className="mt-10 flex items-center justify-center gap-4"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav>}</>}
  </main>;
}
