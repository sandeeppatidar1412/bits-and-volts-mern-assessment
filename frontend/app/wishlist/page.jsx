"use client";
import { useEffect, useState } from "react";
import ProtectedPage from "../../components/ProtectedPage";
export default function WishlistPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadWishlist = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/wishlist`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const result = await response.json();
                if (!response.ok)
                    throw new Error(result.message || "Unable to load wishlist");
                setItems(result.data || []);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                setLoading(false);
            }
        };
        loadWishlist();
    }, []);
    if (loading) {
        return <div className="mx-auto max-w-5xl px-4 py-16 text-slate-600">Loading wishlist...</div>;
    }
    return (<ProtectedPage><main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Wishlist</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Saved for later</h1>
      </div>

      {items.length === 0 ? (<div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-xl font-semibold text-slate-900">No wishlist items yet</p>
          <p className="mt-2 text-slate-600">Save products you love and come back anytime.</p>
        </div>) : (<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (<div key={item._id || item.product?._id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-40 rounded-2xl bg-gradient-to-br from-lime-100 via-emerald-50 to-orange-50"/>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{item.product?.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.product?.shortDescription}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900">₹{item.product?.price}</span>
                <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Move to cart</button>
              </div>
            </div>))}
        </div>)}
    </main></ProtectedPage>);
}


