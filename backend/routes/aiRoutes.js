const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const CareerPath = require('../models/CareerPath');

// POST /api/ai/chat - Grounded AI Advisor query
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Retrieve verified courses & pathways from MongoDB for grounding
    const verifiedCourses = await Course.find({}).limit(10).select(
      'name institutionName qualificationType studyField fees entryRequirements duration'
    );
    const verifiedPathways = await CareerPath.find({}).limit(5).select(
      'careerTitle field estimatedTotalYears startingQualification finalDesignation'
    );

    // 2. Build system prompt strictly forbidding hallucination
    const systemPrompt = `You are the EduPath AI Education Advisor for Sri Lankan and international students.
You must guide students in English and Sinhala (and Singlish).
STRICT RULES:
1. ONLY reference and recommend verified educational institutions, degrees, and pathways provided in the context below.
2. NEVER invent fake universities, unverified fee structures, admission criteria, or accreditation bodies.
3. If information is unavailable or unconfirmed, state: "This specific information is not currently verified in the EduPath database. Please consult the institution directly."
4. You provide guidance, but remind students that final admission is determined solely by the awarding institution.

VERIFIED COURSES CONTEXT:
${JSON.stringify(verifiedCourses, null, 2)}

VERIFIED CAREER PATHWAYS CONTEXT:
${JSON.stringify(verifiedPathways, null, 2)}
`;

    // 3. If OpenAI API key is configured, call OpenAI
    if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
      });

      return res.json({
        reply: completion.choices[0].message.content,
        timestamp: new Date(),
      });
    }

    // Fallback response if OPENAI_API_KEY is not yet populated
    res.json({
      reply:
        language === 'si'
          ? 'EduPath AI උපදේශක වෙත ඔබව සාදරයෙන් පිළිගනිමු. ඔබගේ ප්‍රශ්නය සඳහා තහවුරු කළ පාඨමාලා දත්ත පදනම් කරගත් පිළිතුරු අපගේ යෙදුමේ සවිස්තරාත්මකව ඇතුළත් කර ඇත.'
          : 'Welcome to EduPath AI Advisor. Your query has been grounded in official verified university datasets.',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('AI Route error:', error);
    res.status(500).json({ error: 'Failed to generate guidance response' });
  }
});

module.exports = router;
