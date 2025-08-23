const partnerBrands = [
  { name: "Nike", logo: "N" },
  { name: "Adidas", logo: "A" },
  { name: "Under Armour", logo: "UA" },
  { name: "Reebok", logo: "R" },
  { name: "Puma", logo: "P" },
  { name: "New Balance", logo: "NB" },
]

export function PartnerBrands() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-400 font-light uppercase tracking-wider mb-4">Trusted Partners</p>
          <h3 className="text-2xl lg:text-3xl font-light text-white">
            Powered by <span className="text-gray-400">Industry Leaders</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partnerBrands.map((brand, index) => (
            <div key={index} className="flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 hover:border-gray-600 transition-colors">
                <span className="text-gray-400 font-bold text-lg">{brand.logo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
