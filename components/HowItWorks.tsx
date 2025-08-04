const steps = [
  {
    icon: 'assets/icons/topic.png', // example, replace with real path
    title: 'Choose your topic',
    description: 'Decide what you are passionate about and want to teach',
  },
  {
    icon: 'assets/icons/upload.png',
    title: 'Upload content',
    description: 'Easily add videos, PDFs and other course contents',
  },
  {
    icon: 'assets/icons/publish.png',
    title: 'Publish and earn',
    description: 'Launch your course and start making money from your expertise',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How it Works</h2>
      <div className="how-cards">
        {steps.map((step, idx) => (
          <div key={idx} className="how-card">
            <div className="icon-wrapper">
              <img src={step.icon} alt={step.title} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
