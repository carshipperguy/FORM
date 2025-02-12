import Image from "@/components/ui/image";

export function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-6 mt-8">
      <div className="flex items-center gap-2">
        <Image
          src="/google.png"
          alt="Google Verified"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
      <div className="flex items-center gap-2">
        <Image
          src="/bbb-trust-logo.webp"
          alt="BBB Accredited Business"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
    </div>
  );
}
