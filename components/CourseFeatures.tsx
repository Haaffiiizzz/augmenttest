
const features = [
  'Self-paced, scheduled, and cohort courses',
  'Live lessons and webinars',
  'Start with AI',
  'Engaging multimedia lessons',
  'Unified courses and communities',
];

export default function CourseFeatures() {
  return (
    <section className="course-section">
      <div className="course-wrapper">
        <div className="course-text">
          <h2>Courses your customers will love and pay for</h2>
          <p>
            PDMA’s easy-to-use platform helps you create engaging, high-quality
            experiences that boost learner success and satisfaction.
          </p>

          <div className="course-features">
            {features.map((text, i) => (
              <div key={i} className="course-feature">
                <span>{text}</span>
                <span className="plus">+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="course-image">
          <img src="assets/images/laptop-girl.jpg" alt="Student using platform" />
        </div>
      </div>
    </section>
  );
}
