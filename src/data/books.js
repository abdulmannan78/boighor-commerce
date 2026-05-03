const colors = ["#0f7b55", "#2456a6", "#9b3a31", "#6f4cb8", "#cc7a00", "#19342c", "#a33f78", "#476a2f", "#475467", "#8a4b2a"];

export const categories = [
  "Religious",
  "Novel",
  "Self Help",
  "Language",
  "Children",
  "Liberation War",
  "Science Fiction",
  "Business",
  "Programming",
  "Biography",
  "History",
  "Exam Prep",
  "IT Security",
];

const authors = [
  "Humayun Ahmed",
  "Muhammed Zafar Iqbal",
  "Anisul Hoque",
  "Arif Azad",
  "Sarat Chandra Chattopadhyay",
  "Rabindranath Tagore",
  "Kazi Nazrul Islam",
  "Saifur Rahman",
  "Sayeed A. Chowdhury",
  "Ayman Sadiq",
  "Rahat Khan",
  "Selina Hossain",
  "Imdadul Haq Milon",
  "Abdullah Abu Sayeed",
  "Sheikh Mujibur Rahman",
];

const titles = [
  "Paradoxical Sajid", "Bela Furabar Age", "Smart English Smart Way", "Spoken English at Home", "English Therapy", "Vocabulary for Everyone", "The Unfinished Memoirs", "Karagarer Rojnamcha", "Computer Programming", "Dopamine Detox",
  "Productive Muslim", "Rich Dad Poor Dad", "The Power of Your Subconscious Mind", "Himu Samagra", "Misir Ali Omnibus", "Amar Bondhu Rashed", "Science Project 101", "Freelancing from Internet", "Communication Hacks", "Student Hacks",
  "Basic to Magic Math", "Bangla A Plus", "Quraner Shobdaboli", "Nobi Jiboner Golpo", "Riyadus Saliheen", "Ar-Raheeq Al-Makhtum", "Bukhari Sharif Set", "Pocket Hajj and Umrah", "Italian Language in 30 Days", "Parineeta",
  "Chokher Bali", "Gitanjali", "Agnibina", "Lalsalu", "Kobor", "Ekattorer Dinguli", "Muktijuddher Itihash", "Ma", "Joddha", "Deyal",
  "Badshah Namdar", "Jochna O Jononir Golpo", "Nondito Noroke", "Shonkhonil Karagar", "Tin Goyenda Adventure", "Feluda Collection", "Sherlock Holmes Bangla", "Rahasya Samagra", "Practical Accounting", "Cash Machine",
  "Small Business Playbook", "Digital Marketing Bangla", "Smart Facebook Marketing", "Never Stop Learning", "Leadership Notes", "Startup Bangladesh", "Financial Freedom", "Investing Basics", "Sales Psychology", "Negotiation Toolkit",
  "IELTS Roadmap", "BCS Preliminary Guide", "GK for Bangladesh", "English Grammar Easy", "Spoken Fighter", "Academic Writing", "Kids Quran Stories", "Rhymes for Little Readers", "Drawing for Children", "Teen Science Stories",
  "Space and Stars", "Robotics Beginner", "Python for New Coders", "JavaScript Bangla", "Data Science Starter", "AI for Students", "Cyber Security Basics", "Web Design Handbook", "Laravel Practical", "WordPress Commerce",
  "Bangladesh History", "Bangabandhu and Bangladesh", "River Stories", "Travel Bangladesh", "Cooking at Home", "Health and Fitness", "Mindful Life", "Family Parenting", "Women of Bengal", "Poetry of Rain",
  "Short Stories 2026", "Translated World Classics", "Philosophy for Life", "Law and Justice", "Medical Admission Guide", "Engineering Math", "Olympiad Problem Book", "Nature and Outdoors", "Sports Quiz", "Media and Journalism",
];

const securityBooks = [
  { title: "Cyber Security Fundamentals", author: "Nadia Rahman" },
  { title: "Ethical Hacking Starter Guide", author: "Tanvir Hasan" },
  { title: "Network Security Practical Lab", author: "Mahmudul Karim" },
  { title: "Linux Server Hardening", author: "Sabrina Islam" },
  { title: "Web Application Security", author: "Farhan Ahmed" },
  { title: "SOC Analyst Field Notes", author: "Afsana Chowdhury" },
  { title: "Cloud Security Essentials", author: "Rafiq Alam" },
  { title: "Digital Forensics Basics", author: "Muntasir Kabir" },
  { title: "Malware Analysis Beginner", author: "Rumana Akter" },
  { title: "Incident Response Playbook", author: "Sajjad Hossain" },
];

export const createBooks = () => [...titles, ...securityBooks.map((book) => book.title)].map((title, index) => {
  const price = 90 + ((index * 37) % 720);
  const securityBook = index >= titles.length ? securityBooks[index - titles.length] : null;

  return {
    id: `BK-${String(index + 1).padStart(3, "0")}`,
    title,
    author: securityBook?.author || authors[index % authors.length],
    category: securityBook ? "IT Security" : categories[index % (categories.length - 1)],
    isbn: `978-984-${String(100000 + index * 791).slice(0, 6)}`,
    price,
    oldPrice: Math.round(price * (1.18 + (index % 4) * 0.08)),
    stock: 3 + ((index * 11) % 48),
    rating: (4 + ((index % 10) / 10)).toFixed(1),
    color: colors[index % colors.length],
    cover: `/covers/BK-${String(index + 1).padStart(3, "0")}.svg`,
  };
});
