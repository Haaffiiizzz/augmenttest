
const testimonials = [
  {
    name: 'Bailey Howard',
    image: 'assets/images/bailey.jpg',
    text: 'Creating courses used to feel overwhelming. PDMA made it intuitive and my students love the results.',
  },
  {
    name: 'Michael Johnson',
    image: 'assets/images/michael.png',
    text: "PDMA helped me monetize my passion without compromising my vision. It feels like I'm running my own studio, but smarter.",
  },
  {
    name: 'Alex Peter',
    image: 'assets/images/alex.jpg',
    text: 'I never imagined turning my knowledge into a full-fledged course. PDMA gave me the platform, tools, and confidence to make it real.',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <h2>Success Stories from Creators</h2>
      <p className="testimonials-sub">
        See how course creators have transformed ideas into structured learning experiences all with PDMA.
      </p>

      <div className="testimonial-cards">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="user">
              <img src={t.image} alt={t.name} />
              <strong>{t.name}</strong>
            </div>
            <p className="testimonial-text">{t.text}</p>
            <div className="stars">★★★★★</div>
          </div>
        ))}
      </div>
    </section>
  );
}
