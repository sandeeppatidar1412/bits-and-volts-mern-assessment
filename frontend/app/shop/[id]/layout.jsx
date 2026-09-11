export async function generateMetadata({ params }) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const response = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 300 } });
    if (!response.ok) return { title: "Product | Naik Foods" };
    const result = await response.json();
    const product = result.data;
    const description = (product.shortDescription || product.description || "Shop regional food products from Naik Foods.").replace(/[#*_`]/g, "").slice(0, 155);
    return { title: `${product.name} | Naik Foods`, description, alternates: { canonical: `/shop/${product._id}` }, openGraph: { title: product.name, description, images: product.images?.[0] ? [product.images[0]] : [] } };
  } catch {
    return { title: "Product | Naik Foods" };
  }
}
export default function ProductLayout({ children }) { return children; }
