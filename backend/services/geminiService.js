import axios from 'axios';

/**
 * Checks symptoms and returns possible conditions, recommended specialist, and next steps.
 * Fallback to rule-based analysis if GEMINI_API_KEY is not defined.
 */
export const analyzeSymptoms = async (symptoms) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment. Falling back to local rule-based diagnostics.');
    return getLocalSymptomAnalysis(symptoms);
  }

  const prompt = `
You are an AI Symptom Checker for a medical system. Analyze these symptoms: "${symptoms}".
You must output a raw, valid JSON object with the following schema:
{
  "conditions": [
    {
      "name": "Possible Condition Name",
      "probability": "High" | "Medium" | "Low",
      "description": "Brief, patient-friendly description."
    }
  ],
  "specialist": "Recommended specialist, choose ONLY from: 'Cardiologist', 'Pediatrician', 'Dermatologist', 'Neurologist', 'General Practitioner', 'Orthopedist'",
  "nextSteps": [
    "Next step recommendation 1",
    "Next step recommendation 2"
  ]
}
Provide ONLY the raw JSON object. Do not wrap in \`\`\`json \`\`\` or any other markdown text.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const resultText = response.data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(resultText.trim());
    return parsedData;
  } catch (error) {
    console.error('Gemini API request failed:', error.message);
    return getLocalSymptomAnalysis(symptoms);
  }
};

/**
 * Robust rule-based diagnostic engine for offline/fallback mode.
 */
function getLocalSymptomAnalysis(symptoms) {
  const sym = symptoms.toLowerCase();
  
  let conditions = [];
  let specialist = 'General Practitioner';
  let nextSteps = [
    'Schedule a consultation with our recommended doctor.',
    'Keep a log of symptoms, noting times and triggers.',
    'If symptoms worsen, please seek immediate medical care.'
  ];

  if (sym.includes('chest') || sym.includes('heart') || sym.includes('palpitation') || sym.includes('cardiac')) {
    conditions = [
      { name: 'Angina or Arrhythmia', probability: 'Medium', description: 'Possible heart rhythm irregularity or chest discomfort due to restricted blood flow.' },
      { name: 'Gastroesophageal Reflux Disease (GERD)', probability: 'Low', description: 'Acid reflux mimicking chest tightness.' }
    ];
    specialist = 'Cardiologist';
    nextSteps.unshift('Monitor blood pressure and avoid strenuous activities.');
    nextSteps.unshift('IMPORTANT: Go to the nearest emergency room if you experience sudden, severe chest pain spreading to your arm or jaw.');
  } else if (sym.includes('skin') || sym.includes('rash') || sym.includes('itch') || sym.includes('spot') || sym.includes('allergy')) {
    conditions = [
      { name: 'Dermatitis or Eczema', probability: 'High', description: 'Skin inflammation caused by allergic reaction, irritants, or immune system factors.' },
      { name: 'Fungal Infection', probability: 'Medium', description: 'Superficial skin infection characterized by redness and itchiness.' }
    ];
    specialist = 'Dermatologist';
    nextSteps.unshift('Avoid scratching the affected area to prevent secondary infection.');
    nextSteps.unshift('Apply mild, hypoallergenic moisturizers or soothing calamine lotion.');
  } else if (sym.includes('child') || sym.includes('baby') || sym.includes('infant') || sym.includes('toddler')) {
    conditions = [
      { name: 'Common Pediatric Viral Infection', probability: 'High', description: 'Routine childhood respiratory or enteric virus infection.' }
    ];
    specialist = 'Pediatrician';
    nextSteps.unshift('Ensure the child stays well hydrated with electrolytes.');
    nextSteps.unshift('Administer age-appropriate fever reducers under medical guidance.');
  } else if (sym.includes('headache') || sym.includes('dizzy') || sym.includes('numb') || sym.includes('seizure') || sym.includes('migraine')) {
    conditions = [
      { name: 'Migraine', probability: 'High', description: 'Neurological condition causing intense throbbing headaches, often accompanied by sensory disturbances.' },
      { name: 'Tension Headache', probability: 'Medium', description: 'Dull ache commonly triggered by stress, dehydration, or muscle strain.' }
    ];
    specialist = 'Neurologist';
    nextSteps.unshift('Rest in a dark, quiet, well-ventilated room.');
    nextSteps.unshift('Stay hydrated and minimize screen time.');
  } else if (sym.includes('bone') || sym.includes('joint') || sym.includes('fracture') || sym.includes('knee') || sym.includes('back pain')) {
    conditions = [
      { name: 'Osteoarthritis or Muscle Strain', probability: 'High', description: 'Wear-and-tear of cartilage or muscle fibers surrounding joints.' },
      { name: 'Ligament Sprain', probability: 'Medium', description: 'Stretching or tearing of ligaments due to sudden twisting or impact.' }
    ];
    specialist = 'Orthopedist';
    nextSteps.unshift('Apply R.I.C.E. principles: Rest, Ice, Compression, and Elevation.');
    nextSteps.unshift('Avoid putting weight or stress on the painful joint.');
  } else {
    // General symptoms (fever, cough, cold, fatigue)
    conditions = [
      { name: 'Viral Infection (Flu/Cold)', probability: 'High', description: 'Standard viral illness affecting the upper respiratory tract.' },
      { name: 'General Fatigue / Dehydration', probability: 'Medium', description: 'Low energy levels often caused by insufficient fluids, rest, or nutrition.' }
    ];
    specialist = 'General Practitioner';
    nextSteps.unshift('Get plenty of bed rest and sleep.');
    nextSteps.unshift('Drink adequate fluids like water, warm broths, and herbal teas.');
  }

  return {
    conditions,
    specialist,
    nextSteps
  };
}
