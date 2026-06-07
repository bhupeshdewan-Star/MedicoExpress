#!/bin/bash
# ========================================================
# CLINCOMMAND OS™ DEMO STUDY DATA SEED TRIGGER
# ========================================================

echo "Seeding ClinCommand OS™ demo datasets..."
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

node db/seed_demo_15_1.js
node db/seed_demo_15_2.js
echo "Demo data seeding complete!"
