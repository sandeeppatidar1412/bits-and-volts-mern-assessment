"use client";
/* eslint-disable @next/next/no-img-element */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, productImage } from "../../../lib/api";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [pincode, setPincode] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { api(`/products/${id}`).then(setProduct).catch((err) => setError(err.message)); }, [id]);
  useEffect(() => { if (localStorage.getItem("token")) api("/wishlist").then((items) => setSaved(items.some((item) => (item.product?._id || item.product) === id))).catch(() => {}); }, [id]);
  const add = async () => { try { await api("/cart", { method: "POST", body: JSON.stringify({ productId: product._id, quantity: 1 }) }); router.push("/cart"); } catch (err) { if (err.message.includes("Authentication")) router.push("/login"); else setError(err.message); } };
  const checkDelivery = async () => { setDelivery(null); try { setDelivery(await api(`/delivery/check?pincode=${pincode}`)); } catch (err) { setDelivery({ serviceable: false, message: err.message }); } };
  const toggleWishlist = async () => { if (!localStorage.getItem("token")) return router.push("/login"); try { await api(`/wishlist${saved ? `/${id}` : ""}`, { method: saved ? "DELETE" : "POST", ...(saved ? {} : { body: JSON.stringify({ productId: id }) }) }); setSaved(!saved); } catch (err) { setError(err.message); } };
  if (error && !product) return <main className="mx-auto max-w-5xl p-8">{error} <Link href="/shop" className="text-emerald-600">Back to shop</Link></main>;
  if (!product) return <main className="mx-auto max-w-5xl p-8">Loading product...</main>;
  const saving = product.compareAtPrice > product.price ? product.compareAtPrice - product.price : 0;
  return <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
    <div className="min-w-0"><div className="relative"><img src={productImage(product)} onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }} alt={product.name} className="aspect-square w-full rounded-[28px] bg-white object-cover" /><button type="button" onClick={toggleWishlist} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm">{saved ? "♥" : "♡"}</button></div></div>
    <div className="min-w-0"><Link href="/shop" className="text-sm font-semibold text-emerald-600">Back to shop</Link><p className="mt-5 text-sm text-slate-500">{product.category?.name || "Food"}</p><h1 className="mt-2 text-4xl font-bold">{product.name}</h1><p className="mt-5 text-slate-600">{product.description}</p><div className="mt-6 flex flex-wrap items-baseline gap-3"><p className="text-3xl font-bold">₹{product.price}</p>{saving > 0 && <><span className="text-slate-500 line-through">₹{product.compareAtPrice}</span><span className="text-sm font-semibold text-emerald-700">Save ₹{saving}</span></>}</div><p className="mt-2 text-sm text-slate-600">{product.stock > 0 ? `${product.stock} available` : "Currently out of stock"}{product.vegetarian === true ? " · Vegetarian" : product.vegetarian === false ? " · Non-vegetarian" : ""}</p><button onClick={add} disabled={product.stock < 1} className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto">{product.stock > 0 ? "Add to cart" : "Out of stock"}</button>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Check delivery</h2><div className="mt-3 flex gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Pincode</span><input value={pincode} onChange={(event) => setPincode(event.target.value)} inputMode="numeric" maxLength="6" placeholder="6-digit pincode" /></label><button type="button" onClick={checkDelivery} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Check</button></div>{delivery && <p role="status" className={`mt-3 text-sm ${delivery.serviceable ? "text-emerald-700" : "text-red-700"}`}>{delivery.message}{delivery.eta ? ` ${delivery.eta}. Shipping ₹${delivery.shipping}.` : ""}</p>}</section>
      <dl className="mt-8 grid gap-3 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">{product.weight && <div><dt className="font-semibold">Net weight</dt><dd className="text-slate-600">{product.weight} {product.unit || "g"}</dd></div>}{product.shelfLife && <div><dt className="font-semibold">Shelf life</dt><dd className="text-slate-600">{product.shelfLife}</dd></div>}{product.storage && <div><dt className="font-semibold">Storage</dt><dd className="text-slate-600">{product.storage}</dd></div>}{product.countryOfOrigin && <div><dt className="font-semibold">Country of origin</dt><dd className="text-slate-600">{product.countryOfOrigin}</dd></div>}</dl>{product.ingredients?.length > 0 && <section className="mt-5"><h2 className="font-bold">Ingredients</h2><p className="mt-1 text-sm text-slate-600">{product.ingredients.join(", ")}</p></section>}{product.allergens?.length > 0 && <section className="mt-5"><h2 className="font-bold">Allergen information</h2><p className="mt-1 text-sm text-slate-600">Contains: {product.allergens.join(", ")}</p></section>}</div>
  </main>;
}
