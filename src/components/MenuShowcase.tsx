const menuGroups = [
  {
    label: 'Signature spreads',
    items: [
      ['Hyderabadi Biryani', 'Fragrant basmati, slow-cooked with layered spices'],
      ['Butter Chicken', 'Creamy, rich and finished with gentle smoke'],
      ['Paneer Tikka', 'Charred, smoky and prepared to order'],
    ],
  },
  {
    label: 'Live counters',
    items: [
      ['Dosa Counter', 'Crisp dosas served hot with fresh accompaniments'],
      ['Chaat Station', 'Bright, crunchy and assembled for your guests'],
      ['Dessert Table', 'Seasonal sweets and small indulgent finishes'],
    ],
  },
]

export default function MenuShowcase() {
  return (
    <section id="menu" className="bg-[#DCC7A8] px-5 py-20 text-[#2C1A0E] md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#80552F]">
              From our kitchen
            </p>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[0.9] tracking-tight md:text-7xl">
              Build a menu
              <br />
              <span className="font-serif italic text-[#7B1E1E]">made for yours.</span>
            </h2>
            <p className="mt-7 max-w-sm text-sm leading-7 text-[#614A39]">
              Choose a direction, then let our team shape the portions, courses
              and service around your guests.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <p className="border-b border-[#2C1A0E]/30 pb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#80552F]">
                  {group.label}
                </p>
                <div>
                  {group.items.map(([name, description], index) => (
                    <article key={name} className="border-b border-[#2C1A0E]/15 py-5">
                      <div className="flex gap-4">
                        <span className="pt-1 text-[10px] text-[#80552F]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="font-display text-xl font-semibold text-[#7B1E1E]">
                            {name}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#725C4C]">
                            {description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-[#2C1A0E]/20 pt-6 sm:flex-row sm:items-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80552F]">
            Vegetarian · Non-vegetarian · Custom menus
          </p>
          <a
            href="https://wa.me/919010995180"
            target="_blank"
            rel="noreferrer"
            className="w-fit bg-[#7B1E1E] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5F1717]"
          >
            Request a custom menu
          </a>
        </div>
      </div>
    </section>
  )
}
