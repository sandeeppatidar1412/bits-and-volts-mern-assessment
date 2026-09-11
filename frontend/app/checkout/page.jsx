"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "../../components/ProtectedPage";
import { api } from "../../lib/api";

const emptyAddress = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "", country: "India" };
export default function CheckoutPage() {
  const router = useRouter();
  const [address, setAddress] = useState(emptyAddress);
  const [delivery, setDelivery] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (key, value) => setAddress((current) => ({ ...current, [key]: value }));
  const checkDelivery = async () => {
    setMessage(""); setDelivery(null);
    try { setDelivery(await api(`/delivery/check?pincode=${address.pincode}`)); }
    catch (error) { setMessage(error.message); }
  };
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setMessage("");
    try { const order = await api("/orders", { method: "POST", body: JSON.stringify({ address }) }); router.push(`/profile?order=${order._id}`); }
    catch (error) { setMessage(error.message); }
    finally { setSubmitting(false); }
  };
  return <ProtectedPage><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="mb-8"><Link href="/cart" className="text-sm font-semibold text-emerald-700">Back to cart</Link><p className="mt-5 text-sm font-semibold uppercase tracking-[.2em] text-emerald-600">Checkout</p><h1 className="mt-2 text-4xl font-bold">Where should we deliver?</h1><p className="mt-3 text-slate-600">Your order total is recalculated securely when you place it.</p></div><form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px]"><section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2">{[["fullName","Full name"],["phone","Phone"],["city","City"],["state","State"],["pincode","Pincode"]].map(([key,label]) => <label key={key} className="text-sm font-medium text-slate-700">{label}<input required value={address[key]} onChange={(event) => update(key, event.target.value)} className="mt-2" inputMode={key === "phone" || key === "pincode" ? "numeric" : "text"}/></label>)}<label className="text-sm font-medium text-slate-700 sm:col-span-2">Address<textarea required value={address.address} onChange={(event) => update("address", event.target.value)} className="mt-2"/></label></div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={checkDelivery} className="rounded-xl border border-emerald-600 px-4 py-2 font-semibold text-emerald-700">Check delivery</button>{delivery && <p className={delivery.serviceable ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{delivery.message}{delivery.eta ? ` ${delivery.eta}.` : ""}</p>}</div>{message && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}</section><aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Order review</h2><p className="mt-3 text-sm text-slate-600">Shipping and tax are calculated from the latest catalogue prices.</p><button disabled={submitting} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Placing order..." : "Place order"}</button></aside></form></main></ProtectedPage>;
}
