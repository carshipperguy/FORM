import Image from "@/components/ui/image";
import { Shield, Star } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="flex flex-col items-center mt-3">
      <div className="flex justify-center gap-2 items-center mb-1">
        <div className="flex items-center px-1.5 py-0.5 bg-[#1e3a8a]/10 rounded">
          <Shield className="h-2.5 w-2.5 text-[#1e3a8a] mr-0.5" />
          <span className="text-[10px] font-medium">100% Insured</span>
        </div>
        <div className="flex items-center px-1.5 py-0.5 bg-[#1e3a8a]/10 rounded">
          <Star className="h-2.5 w-2.5 text-[#1e3a8a] mr-0.5" />
          <span className="text-[10px] font-medium">4.9/5 Rating</span>
        </div>
      </div>
      <p className="text-[9px] text-center text-gray-500 mt-0.5">
        Military Owned • Family Operated • Proudly American
      </p>
    </div>
  );
}