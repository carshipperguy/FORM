import Image from "@/components/ui/image";

export function TrustBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
      <div className="flex items-center gap-2">
        <img
          src="https://amerigo-auto-transport.replit.app/google.png"
          alt="Google Verified"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <img
          src="https://amerigo-auto-transport.replit.app/bbb-trust-logo.webp"
          alt="BBB Accredited Business"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}