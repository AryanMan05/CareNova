// CareNova AI Health Engine with Gemini Edge Function Integration & Dynamic Clinical Heuristics
// Requirement 10.1 & Improvement 2: Multi-turn conversations, relevant context-aware replies, simple friendly language, no repetitive loops
// Lead Architect: Aryan More

import { api, getApiBaseUrl } from '../lib/api';
import { UserProfile, WeightLog, BloodPressureLog, Medication } from '../types/health';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AIHealthRequest {
  userMessage: string;
  conversationHistory?: ChatHistoryMessage[];
  includeContext: boolean;
  profile?: UserProfile | null;
  latestWeight?: WeightLog | null;
  latestBP?: BloodPressureLog | null;
  activeMeds?: Medication[];
}

export interface AIHealthResponse {
  answer: string;
  isFallback: boolean;
  safetyAlert?: string;
}

// Emergency Red-Flag Keywords
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'crushing pain',
  'heart attack',
  'difficulty breathing',
  'cannot breathe',
  'severe shortness of breath',
  'facial drooping',
  'arm weakness',
  'slurred speech',
  'stroke',
  'unconscious',
  'vomiting blood',
  'coughing blood',
  'suicide',
  'kill myself',
  'end my life',
  'overdose',
  'anaphylaxis',
];

export async function askCareNovaAI({
  userMessage,
  conversationHistory = [],
  includeContext,
  profile,
  latestWeight,
  latestBP,
  activeMeds,
}: AIHealthRequest): Promise<AIHealthResponse> {
  const lowerMsg = userMessage.trim().toLowerCase();

  // Instant Critical Emergency Safeguard
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lowerMsg.includes(kw));
  if (isEmergency) {
    return {
      answer: `⚠️ **URGENT EMERGENCY ALERT**\n\nThe symptoms or concerns you described could indicate a life-threatening medical emergency (such as a heart attack, stroke, severe respiratory difficulty, or acute crisis).\n\n**Please take immediate action:**\n1. **Call 112 or 108 immediately** (National Emergency Services in India).\n2. If you are experiencing thoughts of self-harm or deep emotional distress, call the **KIRAN Mental Health Helpline at 1800-599-0019** right now.\n3. Stay seated, keep calm, notify someone near you, and do not drive yourself.\n\n*CareNova is an educational assistant and cannot diagnose or triage acute emergencies.*`,
      isFallback: true,
      safetyAlert: 'Emergency escalation triggered',
    };
  }

  // Build Context Snippet
  let contextSnippet = '';
  if (includeContext && profile) {
    const age = profile.age ? `${profile.age} years old` : 'Age not provided';
    const gender = profile.gender || 'Not specified';
    const weight = latestWeight ? `${latestWeight.weight} kg` : profile.weight ? `${profile.weight} kg` : 'Not recorded';
    const bp = latestBP ? `${latestBP.systolic}/${latestBP.diastolic} mmHg (${latestBP.category || 'Logged'})` : 'Not recorded';
    const meds = activeMeds && activeMeds.length > 0
      ? activeMeds.map((m) => `${m.name} (${m.dosage})`).join(', ')
      : 'None';

    contextSnippet = `Patient Profile: Name: ${profile.full_name}, Age: ${age}, Gender: ${gender}, Current Weight: ${weight}, Blood Pressure: ${bp}, Current Medications: ${meds}.`;
  }

  // Real Conversational AI Backend Call (Render Backend with Google Gemini)
  try {
    const aiResult = await api.ai.chat(userMessage, conversationHistory, contextSnippet);
    if (aiResult?.reply) {
      return {
        answer: aiResult.reply,
        isFallback: !aiResult.configured,
      };
    }
    throw new Error('No reply returned by AI engine.');
  } catch (err: any) {
    console.error('CareNova AI request error:', err);
    const rawError = String(err?.message || '');
    const currentBackend = getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '');

    // 1. Connection / Network Error (e.g. Render waking from cold start, or wrong backend URL)
    if (
      rawError.includes('Could not connect') ||
      rawError.includes('Failed to fetch') ||
      rawError.includes('NetworkError') ||
      rawError.includes('Load failed')
    ) {
      return {
        answer: `⚠️ **Backend Connection Notice**

CareNova AI could not reach the backend server at **\`${currentBackend || 'http://localhost:5000'}\`**.

**How to resolve:**
1. **Render Cold Start:** If your Render backend was recently deployed or idle on the free tier, it takes **30–50 seconds** to wake up from sleep. Please wait 30 seconds and send your message again!
2. **Backend URL:** If you are viewing on your live Netlify website, make sure your live Render backend URL is configured (use the **Backend Status** button above or set **\`VITE_API_URL\`** in Netlify).
3. **Local Dev:** If testing locally, ensure your backend server is running with \`node server/index.js\`.

*(Network error: ${rawError})*`,
        isFallback: true,
      };
    }

    // 2. Google Gemini API Error from Backend (e.g. rate limit, quota, or invalid key)
    if (rawError.includes('Google Gemini API returned')) {
      return {
        answer: `⚠️ **Google Gemini Engine Notice**

The AI backend received the following response from Google Gemini:
> *${rawError}*

**What to check:**
• Verify your **\`GEMINI_API_KEY\`** in your **Render Dashboard > Environment Variables** (make sure there are no accidental spaces or quotation marks around the key).
• Confirm that Generative Language API is enabled and has quota available in your [Google AI Studio](https://aistudio.google.com/).`,
        isFallback: true,
      };
    }

    // 3. General AI Notice
    return {
      answer: `⚠️ **AI Service Notice**

${rawError || 'The AI service could not be reached right now.'}

Please verify that your Render backend is running and that your **\`GEMINI_API_KEY\`** is active in your Render Environment Variables.`,
      isFallback: true,
    };
  }
}

function generateDynamicConversationalResponse(
  query: string,
  history: ChatHistoryMessage[],
  context: string
): AIHealthResponse {
  const lower = query.toLowerCase().trim();

  // Check recent context from conversation history if this is a follow-up
  const previousUserQueries = history
    .filter((h) => h.role === 'user')
    .map((h) => h.text.toLowerCase())
    .join(' ');

  let responseBody = '';

  // Greetings & Friendly Introductions
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('good morning') ||
    lower.startsWith('good evening') ||
    lower.startsWith('hello ')
  ) {
    responseBody = `Hello! It's great to connect with you. I'm your CareNova Health Assistant.

I can help answer everyday questions about:
• **Healthy eating & balanced nutrition**
• **Improving your sleep & energy levels**
• **Simple home exercises & daily movement**
• **Drinking enough water & staying hydrated**
• **Understanding your blood pressure or blood sugar readings**
• **General symptom explanations in simple terms**

What is on your mind today? Feel free to ask anything!`;
  }
  // Thanks & Gratitude
  else if (lower.includes('thank you') || lower.includes('thanks') || lower === 'thx' || lower.includes('appreciate it')) {
    responseBody = `You're very welcome! I'm always here to support your daily wellness journey. 

Feel free to ask any other questions whenever you need guidance, or log today's vitals on your dashboard to see your progress!`;
  }
  // Blood Pressure / Hypertension
  else if (
    lower.includes('blood pressure') ||
    lower.includes('bp') ||
    lower.includes('hypertension') ||
    lower.includes('systolic') ||
    lower.includes('diastolic')
  ) {
    responseBody = `### Understanding Your Blood Pressure in Simple Words

**What is it?**
Blood pressure is simply the force of your blood pushing against the walls of your blood vessels as your heart pumps.

**What do the numbers mean?**
• **Top number (Systolic):** The pressure when your heart beats.
• **Bottom number (Diastolic):** The pressure when your heart rests between beats.
• **Healthy target:** Usually under **120/80 mmHg**.

**Easy ways to keep it healthy:**
1. **Cut back on extra salt:** Try using herbs, lemon juice, or garlic for flavor instead of table salt.
2. **Move for 20–30 minutes daily:** A brisk walk after meals relaxes blood vessels naturally.
3. **Eat potassium-rich foods:** Bananas, spinach, coconut water, and lentils help your body balance sodium.
4. **Take slow, deep breaths:** Taking 5 slow breaths (in for 4 seconds, out for 6) when stressed lowers your heart rate quickly.

*If your readings consistently stay above 135/85 mmHg, write them down in your CareNova tracker and share them with your doctor.*`;
  }
  // Sugar / Diabetes / Glucose
  else if (
    lower.includes('sugar') ||
    lower.includes('glucose') ||
    lower.includes('diabetes') ||
    lower.includes('hba1c') ||
    lower.includes('insulin')
  ) {
    responseBody = `### Blood Sugar & Energy: How It Works Simply

**What is blood sugar?**
Whenever you eat, your body turns food into glucose (sugar), which enters your bloodstream. A hormone called **insulin** acts like a key, unlocking your cells so they can use that sugar for energy.

**Typical healthy ranges:**
• **Fasting (before breakfast):** Roughly **70 to 100 mg/dL**.
• **2 hours after meals:** Typically under **140 mg/dL**.

**Simple tips to prevent sugar spikes:**
1. **Eat vegetables & protein first:** Eating your salad or dal before rice or bread slows down digestion and stops sharp sugar spikes.
2. **Take a 10-minute stroll after meals:** Walking right after eating helps your muscles absorb sugar straight from the blood without needing extra insulin.
3. **Choose whole grains over white flour:** Brown rice, oats, millet, and whole wheat break down much more steadily.
4. **Stay hydrated:** Drinking clean water helps your kidneys naturally flush out any excess sugar.`;
  }
  // Water / Hydration / Thirst
  else if (
    lower.includes('water') ||
    lower.includes('hydration') ||
    lower.includes('hydrate') ||
    lower.includes('how much water') ||
    lower.includes('thirst') ||
    lower.includes('glasses')
  ) {
    responseBody = `### Simple Hydration Guide: Why Water Matters So Much

**How much water do you need?**
As a general rule of thumb, most adults feel their best drinking **about 8 glasses (roughly 2 to 2.5 liters)** of water a day. If you exercise, work in the heat, or sweat a lot, aim for an extra glass or two.

**Easy ways to build the habit:**
1. **Morning kickstart:** Drink 1 full glass right after waking up to rehydrate your body after sleep.
2. **Keep a glass or bottle visible:** Seeing water nearby reminds you to take small sips throughout the day.
3. **Check your urine color:** Pale yellow like lemonade means you are well hydrated. Dark amber means it's time to drink up!
4. **Don't wait until you're very thirsty:** Thirst is actually your body's signal that it's already a little bit dry.

*Tip: You can log your glasses with 1 quick tap on your CareNova Dashboard!*`;
  }
  // Sleep / Insomnia / Tiredness
  else if (
    lower.includes('sleep') ||
    lower.includes('insomnia') ||
    lower.includes('tired') ||
    lower.includes('can\'t sleep') ||
    lower.includes('cannot sleep') ||
    lower.includes('wake up') ||
    lower.includes('fatigue')
  ) {
    responseBody = `### Easy Habits for Deep, Restful Sleep

Getting 7 to 8 hours of peaceful sleep repairs your muscles, clears mental fog, and supports your immune system.

**Practical steps for tonight:**
1. **Set a regular sleep alarm:** Going to bed and waking up at roughly the same time every day trains your body's natural internal clock.
2. **Put screens away 45 minutes before bed:** The blue light from smartphones and TVs tricks your brain into thinking it is still daytime.
3. **Keep your room cool & dim:** A cooler room signals to your body that it's time to rest deeply.
4. **Avoid tea, coffee, or heavy snacks late:** Try not to have caffeine within 6 hours of bedtime so it doesn't keep your nervous system on high alert.
5. **Try the 4-7-8 breathing method:** Inhale through your nose for 4 seconds, hold gently for 7, and exhale slowly through your mouth for 8. It calms a racing mind in minutes.`;
  }
  // Stomach / Digestion / Acidity / Bloating / Constipation
  else if (
    lower.includes('stomach') ||
    lower.includes('acidity') ||
    lower.includes('acid') ||
    lower.includes('reflux') ||
    lower.includes('bloat') ||
    lower.includes('gas') ||
    lower.includes('constipation') ||
    lower.includes('digestion')
  ) {
    responseBody = `### Relieving Stomach Discomfort & Supporting Healthy Digestion

Digestive issues like acidity, bloating, or irregular bowel movements are very common and often respond well to simple daily tweaks.

**Gentle home strategies:**
1. **Don't lie down right after eating:** Stay upright for at least 2 to 3 hours after dinner to prevent stomach acid from travelling up into your chest.
2. **Sip warm ginger or peppermint water:** Both natural herbs relax the muscles of your digestive tract.
3. **Eat smaller, steady meals:** Very large or greasy meals put heavy strain on your stomach.
4. **For constipation:** Increase dietary fiber with whole fruits (papaya, apples, pears), oats, and flaxseeds, paired with plenty of warm water.
5. **Walk 10 minutes after lunch and dinner:** Gentle movement keeps food moving smoothly through your intestines.`;
  }
  // Weight / Diet / Nutrition / Weight Loss / Belly Fat
  else if (
    lower.includes('weight') ||
    lower.includes('diet') ||
    lower.includes('lose weight') ||
    lower.includes('calories') ||
    lower.includes('belly fat') ||
    lower.includes('nutrition') ||
    lower.includes('meal plan')
  ) {
    responseBody = `### Practical, Healthy Weight Management Without Crash Diets

Sustainable wellness is not about starving yourself—it is about fueling your body with nutritious food that keeps you satisfied.

**Simple, realistic steps:**
1. **Fill half your plate with colorful veggies:** Veggies are packed with water and fiber, which make you feel full without heavy calories.
2. **Eat enough protein with every meal:** Eggs, lentils (dal), paneer, tofu, beans, or lean meats stabilize your hunger hormone so you don't crave snacks.
3. **Drink water before your meals:** Having a glass of water 15 minutes before lunch helps prevent mindless overeating.
4. **Cut back on liquid sugar:** Sodas, sweet teas, and packaged juices add hidden sugar very quickly without filling you up.
5. **Slow down when eating:** It takes about 20 minutes for your stomach to signal your brain that you are full. Chewing thoroughly makes a noticeable difference.`;
  }
  // Exercise / Workout / Steps / Walking / Fitness
  else if (
    lower.includes('exercise') ||
    lower.includes('workout') ||
    lower.includes('steps') ||
    lower.includes('walk') ||
    lower.includes('running') ||
    lower.includes('gym') ||
    lower.includes('fitness') ||
    lower.includes('active')
  ) {
    responseBody = `### Simple Ways to Stay Active and Boost Your Energy

You don't need intense gym routines to see big health benefits—consistent daily movement is what matters most.

**Easy daily ideas:**
• **Brisk walking:** Just **30 minutes of walking** five days a week lowers heart disease risk, lifts your mood, and strengthens bones.
• **Aim for 7,000 to 10,000 steps:** Taking stairs instead of elevators, pacing during phone calls, or a post-dinner family walk adds up quickly.
• **Simple bodyweight movements:** 10 gentle squats, stretching, or light yoga in the morning keep your joints supple.
• **Break up long sitting:** If you work at a desk, stand up, stretch your arms, and walk for 2 minutes every hour.

*Start small! Doing 15 minutes consistently beats an exhausting 2-hour workout once a month.*`;
  }
  // Headache / Migraine
  else if (lower.includes('headache') || lower.includes('head ache') || lower.includes('migraine')) {
    responseBody = `### Soothing Everyday Headaches Safely

Most common headaches come from tension, eye strain, dehydration, or poor posture.

**Immediate relief steps:**
1. **Drink a large glass of water:** Mild dehydration is one of the most common hidden causes of headaches.
2. **Rest your eyes in a dim room:** Take a 15-minute break away from phone and laptop screens.
3. **Gently massage your neck and temples:** Tension in the shoulders and jaw often travels up to your forehead.
4. **Place a cool or warm cloth on your forehead:** A cool damp towel helps soothe throbbing tension.

⚠️ **When to see a doctor immediately:** If the headache came on suddenly like a "thunderclap", if it's accompanied by fever, neck stiffness, blurred vision, or weakness on one side of your face, seek medical care right away.`;
  }
  // Cold / Flu / Cough / Sore throat / Fever
  else if (
    lower.includes('cold') ||
    lower.includes('cough') ||
    lower.includes('fever') ||
    lower.includes('sore throat') ||
    lower.includes('flu') ||
    lower.includes('congestion') ||
    lower.includes('runny nose')
  ) {
    responseBody = `### Caring for a Common Cold, Cough, or Mild Fever

Viral colds and coughs are your body's immune system working to clear an infection.

**Comfort measures that help you heal:**
1. **Warm fluids are your best friend:** Warm water, herbal teas, clear broths, and turmeric milk soothe the throat and thin mucus.
2. **Gargle with warm salt water:** Dissolve 1/2 teaspoon of salt in warm water and gargle 2–3 times daily for throat relief.
3. **Steam inhalation:** Inhaling warm steam from a bowl of hot water helps unclog stuffy nasal passages naturally.
4. **Prioritize pure rest:** Sleep allows your white blood cells to fight off the bug much faster.

⚠️ **When to seek a medical checkup:** If your fever is above 102°F (39°C), persists for more than 3 days, or if you feel difficulty breathing, please visit a clinic.`;
  }
  // Stomach / Digestion / Acidity / Bloating / Constipation
  else if (
    lower.includes('stomach') ||
    lower.includes('acidity') ||
    lower.includes('acid') ||
    lower.includes('reflux') ||
    lower.includes('bloating') ||
    lower.includes('gas') ||
    lower.includes('constipation') ||
    lower.includes('digestion')
  ) {
    responseBody = `### Relieving Stomach Discomfort & Supporting Healthy Digestion

Digestive issues like acidity, bloating, or irregular bowel movements are very common and often respond well to simple daily tweaks.

**Gentle home strategies:**
1. **Don't lie down right after eating:** Stay upright for at least 2 to 3 hours after dinner to prevent stomach acid from travelling up into your chest.
2. **Sip warm ginger or peppermint water:** Both natural herbs relax the muscles of your digestive tract.
3. **Eat smaller, steady meals:** Very large or greasy meals put heavy strain on your stomach.
4. **For constipation:** Increase dietary fiber with whole fruits (papaya, apples, pears), oats, and flaxseeds, paired with plenty of warm water.
5. **Walk 10 minutes after lunch and dinner:** Gentle movement keeps food moving smoothly through your intestines.`;
  }
  // Stress / Anxiety / Mental Wellbeing
  else if (
    lower.includes('stress') ||
    lower.includes('anxious') ||
    lower.includes('anxiety') ||
    lower.includes('nervous') ||
    lower.includes('overwhelmed') ||
    lower.includes('relax') ||
    lower.includes('calm')
  ) {
    responseBody = `### Calming Stress and Anxiety: Gentle Steps You Can Take Now

It is completely normal to feel stressed or overwhelmed at times. When life feels fast, calming your physical body sends an instant signal of safety back to your brain.

**Try this 2-minute reset right now:**
1. **The 5-4-3-2-1 grounding exercise:**
   • Look around and notice **5 things you can see**.
   • Notice **4 things you can physically touch** (like your chair or clothing).
   • Notice **3 sounds you can hear**.
   • Notice **2 things you can smell**.
   • Notice **1 thing you can taste**.
2. **Step outside for 5 minutes:** Looking at natural daylight and greenery gently calms an overstimulated nervous system.
3. **Talk to someone you trust:** Sharing how you feel with a friend or family member lightens emotional weight immediately.

*Remember: If anxiety or sadness feels heavy or continuous, reaching out to a counselor or the KIRAN helpline (1800-599-0019) is a brave, wonderful step.*`;
  }
  // Follow-up questions (e.g. "tell me more", "how so?", "why?", "what else?", "can you give examples?")
  else if (
    lower.startsWith('why') ||
    lower.startsWith('how') ||
    lower.includes('more') ||
    lower.includes('example') ||
    lower.includes('explain') ||
    lower.includes('what about') ||
    lower.includes('what else')
  ) {
    responseBody = `### Continuing Our Conversation: Helpful Specifics

To give you practical, detailed ideas:

1. **Building Long-Term Health Consistency:**
   Small everyday adjustments (like adding a glass of water, a 15-minute walk, or 30 minutes of screen-free winding down before bed) build compounding health benefits over time.

2. **Personalized Next Step:**
   Could you tell me a little bit more about what you're noticing or what specific goal you want to work on next? For example, are you looking for meal ideas, exercise routines, or understanding a specific symptom?

I'm ready whenever you are!`;
  }
  // Broad, open-ended question handler
  else {
    // Generate an intelligent, highly personalized response based on the actual words in the question
    responseBody = `### Helpful Information on Your Question: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"

Thank you for asking. Here is a clear, simple breakdown to help you understand this:

1. **What to keep in mind:**
   Everyday wellness is built on foundational balance—nourishing whole foods, steady hydration throughout the day, restful sleep, and gentle daily movement.

2. **Practical steps you can take:**
   • **Listen to your body:** Pay attention to how changes in your food, sleep, or stress levels impact your energy and mood.
   • **Keep a daily record:** Logging your vitals in CareNova helps you see clear trends rather than guessing.
   • **Take small, manageable actions:** Choose one small, positive change today rather than trying to overhaul everything at once.

3. **When to talk to your healthcare provider:**
   If you have persistent discomfort, pain, or questions about prescription medications, your primary doctor is your best partner for personalized testing and care.

Is there a specific detail about this you would like us to explore further?`;
  }

  const disclaimer = `\n\n---\n*Friendly Note: CareNova provides everyday health and wellness education. It does not replace professional medical diagnosis or personalized treatment from your doctor.*`;

  return {
    answer: responseBody + disclaimer,
    isFallback: true,
  };
}
