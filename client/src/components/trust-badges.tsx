import Image from "@/components/ui/image";
import { Shield, Star } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex justify-center gap-3 items-center mb-2">
        <div className="flex items-center px-2 py-1 bg-[#1e3a8a]/10 rounded-md">
          <Shield className="h-3 w-3 text-[#1e3a8a] mr-1" />
          <span className="text-xs font-medium">100% Insured</span>
        </div>
        <div className="flex items-center px-2 py-1 bg-[#1e3a8a]/10 rounded-md">
          <Star className="h-3 w-3 text-[#1e3a8a] mr-1" />
          <span className="text-xs font-medium">4.9/5 Rating</span>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500">
        Military Owned • Family Operated • Proudly American
      </p>
    </div>
  );
}