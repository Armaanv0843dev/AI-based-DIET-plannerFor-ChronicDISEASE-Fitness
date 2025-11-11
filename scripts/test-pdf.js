const fs = require('fs');
const path = require('path');

async function run() {
  const route = require(path.join(process.cwd(), 'src', 'app', 'api', 'diet-pdf', 'route.js'));
  if (!route || !route.POST) {
    console.error('route handler not found or not compiled to JS (are you running TypeScript?)');
    process.exit(1);
  }

  const sample = {
    profile: { age: 30, gender: 'Male', region: 'India' },
    calorieBreakdown: 2000,
    macronutrientBreakdown: { protein: 97, carbs: 202, fat: 42 },
    dietPlan: {
      breakfast: [
        { name: 'Moong Dal Bhurji (150g tofu)', description: 'With steamed vegetables', calories: 350, protein: 28, carbs: 20, fat: 15 }
      ],
      lunch: [
        { name: 'Mixed Veg Curry (1.5 cups)', description: 'With 2 multigrain rotis', calories: 480, protein: 20, carbs: 70, fat: 10 }
      ],
      dinner: [
        { name: 'Paneer Sabzi (120g)', description: 'With 2 multigrain rotis', calories: 500, protein: 30, carbs: 55, fat: 20 }
      ],
      snacks: [
        { name: 'Roasted Chana (30g)', description: 'Protein-rich snack', calories: 190, protein: 8, carbs: 35, fat: 3 }
      ]
    },
    importantNotes: '• Drink water\n• Prefer whole grains\n• Avoid sugary drinks'
  };

  // Create a Request-like object
  const req = new Request('http://localhost/api/diet-pdf', { method: 'POST', body: JSON.stringify(sample), headers: { 'Content-Type': 'application/json' } });

  const res = await route.POST(req);
  if (!res || !res.arrayBuffer) {
    console.error('Unexpected response from route');
    process.exit(1);
  }
  const arr = await res.arrayBuffer();
  const buf = Buffer.from(arr);
  const out = path.join(process.cwd(), 'tmp', 'test-diet.pdf');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log('Wrote PDF to', out);
}

run().catch((e) => { console.error(e); process.exit(1); });
