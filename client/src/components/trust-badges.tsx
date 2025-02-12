import Image from "@/components/ui/image";

export function TrustBadges() {
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-semibold mb-4">Our Trust & Ratings</h2>
      <div className="flex flex-wrap justify-center gap-5">
        <img
          src="google.png"
          alt="Google 4.7 Star Rating"
          style={{ 
            width: 'auto',
            maxWidth: '200px',
            height: 'auto'
          }}
        />
        <img
          src="bbb trust logo.webp"
          alt="BBB Accredited Business"
          style={{ 
            width: 'auto',
            maxWidth: '200px',
            height: 'auto'
          }}
        />
      </div>
    </div>
  );
}