"use client";

const serif = "font-[var(--font-serif)]";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#060612] text-white">
      <div className="max-w-2xl mx-auto px-6 sm:px-12 py-24">
        <h1 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-3`}>
          Privacy Policy
        </h1>
        <p className="text-[13px] text-white/25 mb-16">Last updated: March 3, 2026</p>

        <div className="space-y-12 text-[15px] text-white/50 leading-[1.85]">
          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              1. Information We Collect
            </h2>
            <p>
              When you use Cosmii, we collect the following information to provide and improve our service:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li><strong className="text-white/65">Uploaded Content</strong> — Books and documents you upload (PDF, EPUB, TXT) are processed to build your personal knowledge graph. Content is stored on our servers solely for your use.</li>
              <li><strong className="text-white/65">Usage Data</strong> — We collect anonymized interaction data such as pages visited, features used, and session duration to improve the product experience.</li>
              <li><strong className="text-white/65">Account Information</strong> — If you create an account, we store your email address and authentication credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="space-y-2 list-disc list-outside ml-5">
              <li>Process and analyze your uploaded books to generate knowledge graphs, memory structures, and conversational context.</li>
              <li>Provide AI-powered responses based on the content you have uploaded.</li>
              <li>Improve and maintain the reliability and performance of our services.</li>
              <li>Communicate important updates or changes to the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              3. Data Storage & Security
            </h2>
            <p>
              Your uploaded content and generated knowledge graphs are stored securely and are accessible only to you. We use industry-standard encryption for data in transit and at rest. We do not sell, share, or provide your uploaded content to any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              4. Third-Party Services
            </h2>
            <p>
              Cosmii may use third-party AI providers (such as OpenAI) to process queries about your books. When this occurs, only the minimal necessary context is sent, and no personally identifiable information is included. Third-party providers do not retain your data beyond the scope of processing your request.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              5. Data Retention & Deletion
            </h2>
            <p>
              You may delete any uploaded book and its associated data at any time through the dashboard. Upon deletion, all related content, knowledge graph nodes, and memory structures are permanently removed from our systems. If you delete your account, all associated data is erased within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              6. Cookies
            </h2>
            <p>
              We use essential cookies to maintain your session and preferences. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated via email or an in-app notification. Continued use of Cosmii after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              8. Contact
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@cosmii.app" className="text-white/65 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors duration-300">
                privacy@cosmii.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
