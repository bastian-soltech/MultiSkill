'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Dashboard
    'skill_matrix': 'Skill Matrix',
    'skill_radar': 'Skill Radar',
    'total_paths': 'Total Paths',
    'active_quests': 'Active Quests',
    'power_level': 'Power Level',
    'avg_progress': 'Avg Progress',
    'quest_log': 'Quest Log',
    'recent_activity': 'Recent Activity',
    'your_skills': 'Your Skills',
    'your_learning_paths': 'Your Learning Paths',
    'no_skills_added': 'No skills added yet.',
    'start_first_path': 'Start First Path',
    'progress': 'Progress',
    'completion': 'Completion',
    'view_path': 'View Path',
    'manage_path': 'Manage Path',
    'skill_name': 'Skill Name',
    'level': 'Level',
    'action': 'Action',
    'advanced': 'Advanced',
    'intermediate': 'Intermediate',
    'beginner': 'Beginner',
    'forge_new_path': 'Forge New Path',
    'new_learning_path': 'New Learning Path',
    'discipline_name': 'Discipline Name',
    'skill_discipline_name': 'Skill Name',
    'target_duration': 'Target Duration',
    'time_unit': 'Time Unit',
    'days': 'Days',
    'weeks': 'Weeks',
    'months': 'Months',
    'cancel': 'Cancel',
    'activate_grid': '[ACTIVATE GRID]',
    'launch_path': 'Launch Path',

    // Sidebar
    'dashboard': 'Dashboard',
    'explore': 'Explore',
    'milestones': 'Milestones',
    'projects': 'Projects',
    'community': 'Community',
    'logout': 'Logout',
    'rpg_mode': 'RPG Mode',
    'pro_mode': 'Pro Mode',
    'advanced_learner': 'Advanced Learner',
    'pro_member': 'Pro Member',

    // Explore
    'community_library': 'Community Library',
    'community_intelligence': 'Community Intelligence',
    'explore_roadmaps': 'Explore Roadmaps',
    'explore_grimoires': 'Explore Roadmaps',
    'search_community': 'Search community paths...',
    'view': 'View',
    'preview': 'Preview',
    'claim': '[SAVE]',
    'adopt': 'Adopt',
    'character_sheet': 'Character Sheet',
    'skill_collection_growing': 'your skill collection is growing stronger.',
    'profile_summary': 'Profile Summary',
    'skill_status': 'Skill Status',
    'tracking_growth_for': 'Tracking professional growth and skills for',
    'initialize_new_path': 'Initialize New Path',
    'rpg_greeting': 'your journey to mastery continues.',
    'pro_greeting': 'Tracking professional growth for',
    'traveler': 'Traveler',
    'member': 'Member',

    // Landing Page
    'start_journey': 'Start Your Journey',
    'ai_powered': 'AI-Powered Personal Learning',
    'stop_wandering': 'Stop wandering.',
    'start_mastering': 'Start Mastering.',
    'landing_desc': 'Personalized roadmaps, daily accountability, and community-driven insights. Craft your path to mastery with the precision of AI.',
    'custom_roadmaps': 'Custom Roadmaps',
    'custom_roadmaps_desc': 'Generative paths tailored to your specific goals and timeline.',
    'daily_checkins': 'Daily Check-ins',
    'daily_checkins_desc': 'Stay accountable with one-click attendance and learning logs.',
    'community_adoption': 'Community Adoption',
    'community_adoption_desc': 'Adopt successful paths created by masters in the community.',
    'made_for_mastery': 'Made for Mastery.',
    'community_archives': 'Community Archives',
    'community_hub': 'Community Hub',
    'hall_of_grimoires': 'Hall of Grimoires',
    'hall_of_artifacts': 'Hall of Artifacts',
    'discover_grimoires': 'Discover Grimoires',
    'community_intelligence': 'Community Intelligence',
    'community_showcase': 'Community Showcase',
    'project_showroom': 'Project Showroom',
    'showroom_desc_rpg': 'Behold the tangible proofs of mastery forged by fellow travelers in their respective disciplines.',
    'showroom_desc_pro': 'Explore the innovative projects being built as our community masters new skills.',
    'curious_learner': 'Curious Learner',
    'path_details': 'Path details',
    'live': 'Live',
    'no_projects_showroom': 'No projects in the showroom yet.',
    'extract_wisdom': 'Extract wisdom from proven learning sequences crafted by fellow masters.',
    'adopt_wisdom': 'Adopt proven learning paths or find inspiration for your next journey.',
    'modules': 'Modules',
    'term': 'Term',
    'adopt_grimoire': '[ ADOPT GRIMOIRE ]',
    'adopt_roadmap': 'Adopt Roadmap',
    'no_knowledge_paths': 'No knowledge paths found.',
    'steps': 'Steps',
    'projects_desc_rpg': "A collection of everything you've built on your learning journey.",
    'projects_desc_pro': "A comprehensive collection of everything you've built on your journey to mastery.",
    'milestones_desc_rpg': "Track every major step you've completed in your learning journey.",
    'milestones_desc_pro': "A unified view of every milestone across all your learning paths.",

    // Levels - RPG
    'rpg_title_1_2': 'Novice / Vagabond',
    'rpg_title_3_5': 'Apprentice / Squire',
    'rpg_title_6_8': 'Journeyman / Adept',
    'rpg_title_9_10': 'Expert / Grandmaster',
    'rpg_title_max': 'The Sovereign Jack',

    // Levels - Professional
    'pro_title_1_2': 'Beginner / Novice',
    'pro_title_3_5': 'Junior / Intermediate',
    'pro_title_6_8': 'Advanced / Specialist',
    'pro_title_9_10': 'Senior / Expert',
    'pro_title_max': 'Cross-Functional Master',

    // Milestones
    'active_milestones': 'Active Milestones',
    'your_milestones': 'Your Milestones',

    // Projects
    'saved_projects': 'Saved Projects',
    'your_projects': 'Your Projects',
    'view_live': 'View Live',
    'view_skill': 'View Skill',

    // Skill Details
    'learning_path': 'Learning Path',
    'skill_roadmap': 'Skill Roadmap',
    'goal': 'Goal',
    'add_step': 'Add Step',
    'study_logs': 'Study Logs',
    'learning_logs': 'Learning Logs',
    'save_log': '[SAVE LOG]',
    'save_note': 'Save Note',
    'project_artifacts': 'Project Artifacts',
    'save_artifact': '[SAVE ARTIFACT]',
    'save_project': 'Save Project',
    'ai_advice': 'AI Advice',
    'ai_career_advice': 'AI Career Advice',
    'get_advice': '[GET ADVICE]',
    'request_advice': 'Request Advice',
    'get_started': 'Get Started',
  },
  id: {
    // Dashboard
    'skill_matrix': 'Matriks Skill',
    'skill_radar': 'Radar Skill',
    'total_paths': 'Total Jalur',
    'active_quests': 'Quest Aktif',
    'power_level': 'Level Kekuatan',
    'avg_progress': 'Rata-rata Progres',
    'quest_log': 'Log Quest',
    'recent_activity': 'Aktivitas Terbaru',
    'your_skills': 'Skill Anda',
    'your_learning_paths': 'Jalur Belajar Anda',
    'no_skills_added': 'Belum ada skill yang ditambahkan.',
    'start_first_path': 'Mulai Jalur Pertama',
    'progress': 'Progres',
    'completion': 'Penyelesaian',
    'view_path': 'Lihat Jalur',
    'manage_path': 'Kelola Jalur',
    'skill_name': 'Nama Skill',
    'level': 'Level',
    'action': 'Aksi',
    'advanced': 'Lanjutan',
    'intermediate': 'Menengah',
    'beginner': 'Pemula',
    'forge_new_path': 'Buat Jalur Baru',
    'new_learning_path': 'Jalur Belajar Baru',
    'discipline_name': 'Nama Disiplin',
    'skill_discipline_name': 'Nama Skill',
    'target_duration': 'Target Durasi',
    'time_unit': 'Satuan Waktu',
    'days': 'Hari',
    'weeks': 'Minggu',
    'months': 'Bulan',
    'cancel': 'Batal',
    'activate_grid': '[AKTIFKAN GRID]',
    'launch_path': 'Luncurkan Jalur',

    // Sidebar
    'dashboard': 'Dashboard',
    'explore': 'Jelajahi',
    'milestones': 'Pencapaian',
    'projects': 'Proyek',
    'community': 'Komunitas',
    'logout': 'Keluar',
    'rpg_mode': 'Mode RPG',
    'pro_mode': 'Mode Pro',
    'advanced_learner': 'Pelajar Tingkat Lanjut',
    'pro_member': 'Anggota Pro',

    // Explore
    'community_library': 'Perpustakaan Komunitas',
    'community_intelligence': 'Kecerdasan Komunitas',
    'explore_roadmaps': 'Jelajahi Roadmap',
    'explore_grimoires': 'Jelajahi Roadmap',
    'search_community': 'Cari jalur komunitas...',
    'view': 'Lihat',
    'preview': 'Pratinjau',
    'claim': '[SIMPAN]',
    'adopt': 'Ambil',
    'character_sheet': 'Lembar Karakter',
    'skill_collection_growing': 'koleksi skill kamu semakin kuat.',
    'profile_summary': 'Ringkasan Profil',
    'skill_status': 'Status Skill',
    'tracking_growth_for': 'Melacak pertumbuhan profesional dan skill untuk',
    'initialize_new_path': 'Inisialisasi Jalur Baru',
    'rpg_greeting': 'perjalananmu menuju penguasaan berlanjut.',
    'pro_greeting': 'Melacak pertumbuhan profesional untuk',
    'traveler': 'Pengembara',
    'member': 'Anggota',

    // Landing Page
    'start_journey': 'Mulai Perjalananmu',
    'ai_powered': 'Pembelajaran Personal Berbasis AI',
    'stop_wandering': 'Berhenti bingung.',
    'start_mastering': 'Mulai Menguasai.',
    'landing_desc': 'Roadmap yang dipersonalisasi, akuntabilitas harian, dan wawasan berbasis komunitas. Bentuk jalur suksesmu dengan presisi AI.',
    'custom_roadmaps': 'Roadmap Kustom',
    'custom_roadmaps_desc': 'Jalur generatif yang disesuaikan dengan tujuan dan timeline spesifikmu.',
    'daily_checkins': 'Check-in Harian',
    'daily_checkins_desc': 'Tetap akuntabel dengan absen sekali klik dan log pembelajaran.',
    'community_adoption': 'Adopsi Komunitas',
    'community_adoption_desc': 'Ambil jalur sukses yang dibuat oleh para master di komunitas.',
    'made_for_mastery': 'Dibuat untuk Penguasaan.',
    'community_archives': 'Arsip Komunitas',
    'community_hub': 'Pusat Komunitas',
    'hall_of_grimoires': 'Aula Grimoire',
    'hall_of_artifacts': 'Aula Artefak',
    'discover_grimoires': 'Temukan Grimoire',
    'community_intelligence': 'Kecerdasan Komunitas',
    'community_showcase': 'Showcase Komunitas',
    'project_showroom': 'Showroom Proyek',
    'showroom_desc_rpg': 'Lihatlah bukti nyata penguasaan yang ditempa oleh sesama pengelana dalam disiplin masing-masing.',
    'showroom_desc_pro': 'Jelajahi proyek inovatif yang sedang dibangun saat komunitas kami menguasai skill baru.',
    'curious_learner': 'Pelajar Penasaran',
    'path_details': 'Detail jalur',
    'live': 'Live',
    'no_projects_showroom': 'Belum ada proyek di showroom.',
    'extract_wisdom': 'Ekstrak kebijaksanaan dari urutan pembelajaran terbukti yang dibuat oleh sesama master.',
    'adopt_wisdom': 'Ambil jalur pembelajaran yang terbukti atau temukan inspirasi untuk perjalanan Anda berikutnya.',
    'modules': 'Modul',
    'term': 'Jangka',
    'adopt_grimoire': '[ AMBIL GRIMOIRE ]',
    'adopt_roadmap': 'Ambil Roadmap',
    'no_knowledge_paths': 'Tidak ada jalur pengetahuan yang ditemukan.',
    'steps': 'Langkah',
    'projects_desc_rpg': 'Koleksi dari semua yang telah kamu bangun dalam perjalanan belajarmu.',
    'projects_desc_pro': 'Koleksi komprehensif dari semua yang telah kamu bangun dalam perjalanan menuju penguasaan.',
    'milestones_desc_rpg': "Lacak setiap langkah besar yang telah kamu selesaikan dalam perjalanan belajarmu.",
    'milestones_desc_pro': "Tampilan terpadu dari setiap pencapaian di semua jalur belajarmu.",

    // Levels - RPG
    'rpg_title_1_2': 'Novice / Vagabond',
    'rpg_title_3_5': 'Apprentice / Squire',
    'rpg_title_6_8': 'Journeyman / Adept',
    'rpg_title_9_10': 'Expert / Grandmaster',
    'rpg_title_max': 'The Sovereign Jack',

    // Levels - Professional
    'pro_title_1_2': 'Beginner / Pelajar Baru',
    'pro_title_3_5': 'Junior / Menengah',
    'pro_title_6_8': 'Lanjutan / Spesialis',
    'pro_title_9_10': 'Senior / Pakar',
    'pro_title_max': 'Master Lintas Fungsi',

    // Milestones
    'active_milestones': 'Pencapaian Aktif',
    'your_milestones': 'Pencapaian Anda',

    // Projects
    'saved_projects': 'Proyek Tersimpan',
    'your_projects': 'Proyek Anda',
    'view_live': 'Lihat Live',
    'view_skill': 'Lihat Skill',

    // Skill Details
    'learning_path': 'Jalur Belajar',
    'skill_roadmap': 'Roadmap Skill',
    'goal': 'Target',
    'add_step': 'Tambah Langkah',
    'study_logs': 'Log Belajar',
    'learning_logs': 'Log Belajar',
    'save_log': '[SIMPAN LOG]',
    'save_note': 'Simpan Catatan',
    'project_artifacts': 'Artefak Proyek',
    'save_artifact': '[SIMPAN ARTEFAK]',
    'save_project': 'Simpan Proyek',
    'ai_advice': 'Saran AI',
    'ai_career_advice': 'Saran Karir AI',
    'get_advice': '[DAPATKAN SARAN]',
    'request_advice': 'Minta Saran',
    'get_started': 'Mulai Sekarang',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language;
    if (saved) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
