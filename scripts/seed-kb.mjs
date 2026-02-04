
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const kbData = [
    {
        question: "How do I book an appointment?",
        answer: "To book an appointment, navigate to the 'Appointments' tab on the left sidebar. Click 'New Appointment', select your preferred doctor and time slot, and confirm.",
        tags: ["appointments", "booking", "patient"]
    },
    {
        question: "Where can I see my prescriptions?",
        answer: "Your prescriptions are located in the 'Medical Records' section. Click on 'Prescriptions' to view current and past medications.",
        tags: ["prescriptions", "medications", "records"]
    },
    {
        question: "How do I reset my password?",
        answer: "You can reset your password by going to the 'Settings' page. Look for the 'Security' tab and click 'Change Password'.",
        tags: ["account", "password", "security"]
    },
    {
        question: "What does the Dashboard show?",
        answer: "The Dashboard provides an overview of your health status (for patients) or daily schedule (for doctors). It shows upcoming appointments, recent alerts, and quick actions.",
        tags: ["dashboard", "overview"]
    },
    {
        question: "How do I contact support?",
        answer: "If you need technical assistance, click the 'Help' icon in the bottom left corner or email support@guardian.hms.",
        tags: ["support", "help"]
    },
    {
        question: "Can I update my profile details?",
        answer: "Yes, go to 'Settings' > 'Profile' to update your contact information, profile picture, and emergency contacts.",
        tags: ["profile", "settings"]
    },
    {
        question: "Where can I find my lab results?",
        answer: "Lab results are uploaded to your 'Medical Records' under the 'Documents' or 'Lab Results' section once they are finalized by the lab.",
        tags: ["records", "labs", "results"]
    }
];

async function seedKB() {
    console.log("Seeding Knowledge Base...");

    // Optional: Clear existing entries to avoid duplicates during dev
    // await supabase.from('knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

    const { data, error } = await supabase
        .from('knowledge_base')
        .insert(kbData)
        .select();

    if (error) {
        console.error("Error seeding KB:", error);
    } else {
        console.log(`Successfully added ${data.length} articles to the Knowledge Base.`);
    }
}

seedKB();
