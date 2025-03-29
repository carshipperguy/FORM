import { useLocation } from "wouter";
import { type QuoteFormData } from "@shared/schema";
// @ts-ignore - This is a JSX file being imported into a TSX file
import QuoteOptions from "@/components/QuoteOptions"; 

export default function FinalQuote() {
  const [, navigate] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ?
    JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as QuoteFormData :
    null;

  if (!data) {
    navigate("/");
    return null;
  }

  return <QuoteOptions data={data} />;
}