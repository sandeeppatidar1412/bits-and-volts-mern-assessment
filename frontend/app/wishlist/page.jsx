"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "../../components/ProtectedPage";
import { api, productImage } from "../../lib/api";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadWishlist = async () => { try { setItems(await api("/wishlist")); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(loadWishlist, 0); return () => window.clearTimeout(timer); }, []);
  const remove = async (id) => { try { await api(`/wishlist/${id}`, { method: "DELETE" }); setItems((current) => current.filter((item) => (item.product?._id || item.product) !== id)); } catch (err) { setError(err.message); } };
  const moveToCart = async (product) => { try { await api("/cart", { method: "POST", body: JSON.stringify({ productId: product._id, quantity: 1 }) }); router.push("/cart"); } catch (err) { setError(err.message); } };
  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16 text-slate-600">Loading wishlist...</div>;
  return <ProtectedPage><main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Wishlist</p><h1 className="mt-2 text-4xl font-bold text-slate-900">Saved for later</h1></div>{error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{items.length === 0 ? <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-xl font-semibold text-slate-900">No wishlist items yet</p><p className="mt-2 text-slate-600">Save products from the shop to find them here.</p><Link href="/shop" className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Browse products</Link></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const product = item.product; return <article key={item._id || product?._id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><Link href={`/shop/${product?._id}`}><img src={productImage(product)} onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }} alt={product?.name || "Saved product"} className="aspect-[4/3] w-full object-cover" /></Link><div className="p-5"><h2 className="text-xl font-bold text-slate-900">{product?.name}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-600">{product?.shortDescription}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-xl font-bold text-slate-900">₹{product?.price}</span><button type="button" onClick={() => remove(product?._id)} className="text-sm font-semibold text-red-600">Remove</button></div><button type="button" onClick={() => moveToCart(product)} disabled={!product?.stock} className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{product?.stock ? "Move to cart" : "Out of stock"}</button></div></article>; })}</div>}</main></ProtectedPage>;
}
