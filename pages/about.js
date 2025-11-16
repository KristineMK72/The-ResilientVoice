import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-12 py-20 flex justify-center">
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="prose prose-lg md:prose-xl prose-gray max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-14"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          About The Resilient Voice
        </h1>

        <p className="text-gray-700 leading-relaxed">
          The Resilient Voice was born from storms — the kind that shake you,
          refine you, and push you closer to God’s purpose. Every hardship,
          heartbreak, and silent battle became a reminder that even when life
          breaks us open, grace pours in.
        </p>

        <p className="text-gray-700 leading-relaxed">
          This brand is more than apparel. It is a mission rooted in healing,
          faith, and courage. Every design is crafted to speak life — to remind
          you that you are seen, you are strong, and you are deeply loved.
        </p>

        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-800 my-6">
          “You are not alone.  
          You have strength.  
          You are seen.”
        </blockquote>

        <h2 className="text-2xl font-bold text-gray-900 mt-10">
          Our Purpose & Impact
        </h2>

        <p className="text-gray-700 leading-relaxed">
          Part of walking in purpose means giving back. That’s why{" "}
          <strong className="text-gray-900 font-bold">
            **10% of all proceeds are donated to nonprofits**
          </strong>{" "}
          that support people who need hope the most:
        </p>

        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>🕊️ Suicide prevention & awareness</li>
          <li>💬 Anti-bullying programs</li>
          <li>💚 Mental health support networks</li>
          <li>🏠 Homelessness relief and restoration</li>
        </ul>

        <p className="text-gray-700 leading-relaxed">
          These causes resonate deeply because they reflect the storms I’ve
          survived — moments when hope felt far away, yet grace showed up through
          a message, a person, or a single act of compassion.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10">
          A Community of Faith & Strength
        </h2>

        <p className="text-gray-700 leading-relaxed">
          When you wear The Resilient Voice, you’re not just buying apparel —
          you're becoming part of a movement. You’re spreading messages of hope,
          resilience, and God’s unshakable grace.
        </p>

        <p className="text-gray-700 leading-relaxed">
          My prayer is that this becomes a community of people who lift each
          other up, speak life into one another, and walk boldly in their
          purpose.
        </p>

        <p className="text-gray-800 font-semibold mt-8">
          🌿 With love, faith, and gratitude,  
          <br />
          Kristine — Founder, The Resilient Voice
        </p>
      </motion.article>
    </div>
  );
}
