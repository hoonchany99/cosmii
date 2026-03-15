"use client";

const serif = "font-[var(--font-serif)]";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#060612] text-white">
      <div className="max-w-2xl mx-auto px-6 sm:px-12 py-24">
        <h1 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-3`}>
          Terms of Service
        </h1>
        <p className="text-[13px] text-white/25 mb-16">Last updated: March 3, 2026</p>

        <div className="space-y-12 text-[15px] text-white/50 leading-[1.85]">
          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Cosmii ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              2. Description of Service
            </h2>
            <p>
              Cosmii is an AI-powered reading companion that processes uploaded books and documents, builds structured knowledge graphs and memory, and enables conversational interaction with your content. The Service includes book ingestion, knowledge graph generation, and AI-assisted question answering.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              3. User Content
            </h2>
            <ul className="space-y-2 list-disc list-outside ml-5">
              <li>You retain all ownership rights to the books and documents you upload.</li>
              <li>By uploading content, you grant Cosmii a limited license to process, analyze, and store that content solely for the purpose of providing the Service to you.</li>
              <li>You are responsible for ensuring you have the right to upload and process the content you provide. Do not upload content that you do not own or have permission to use.</li>
              <li>We do not claim ownership of any content you upload.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              4. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
              <li>Use the Service to infringe upon the intellectual property rights of others.</li>
              <li>Attempt to reverse-engineer, decompile, or extract the underlying models or algorithms.</li>
              <li>Use automated systems to excessively load or disrupt the Service.</li>
              <li>Share your account credentials or allow unauthorized access to your account.</li>
              <li>Use the Service for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              5. AI-Generated Responses
            </h2>
            <p>
              Cosmii uses artificial intelligence to generate responses based on your uploaded content. While we strive for accuracy, AI-generated responses may contain errors, omissions, or inaccuracies. The Service is intended as a reading aid and should not be relied upon as the sole source of truth for critical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              6. Service Availability
            </h2>
            <p>
              We aim to provide reliable and uninterrupted access to the Service, but we do not guarantee 100% uptime. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify, suspend, or discontinue any part of the Service with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Cosmii and its creators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              8. Termination
            </h2>
            <p>
              You may stop using the Service and delete your account at any time. We reserve the right to suspend or terminate your access if you violate these Terms. Upon termination, your uploaded content and associated data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 14 days before they take effect. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/75 tracking-wide uppercase mb-4">
              10. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@cosmii.app" className="text-white/65 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors duration-300">
                legal@cosmii.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
