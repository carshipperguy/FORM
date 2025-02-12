import Image from "@/components/ui/image";

export function TrustBadges() {
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-semibold mb-4">Our Trust & Ratings</h2>
      <div className="flex flex-wrap justify-center gap-5">
        <Image
          src="/google-badge.png"
          alt="Google 4.7 Star Rating"
          width={200}
          height={80}
          className="object-contain"
        />
        <Image
          src="/bbb-badge.png"
          alt="BBB Accredited Business"
          width={200}
          height={80}
          className="object-contain"
        />
      </div>
    </div>
  );
}