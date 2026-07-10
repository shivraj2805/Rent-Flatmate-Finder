import {
  BadgeCheck,
  Bot,
  House,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Clock3,
  CircleDollarSign,
  HeartHandshake,
  Building2,
  UserRound,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  ThumbsUp,
  Zap,
} from 'lucide-react'

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Matcher', href: '#ai-showcase' },
  { label: 'Listings', href: '#listings' },
  { label: 'FAQ', href: '#faq' },
]

export const stats = [
  { label: 'Active Users', value: '12,400+', icon: Users, desc: 'Growing community in Pune' },
  { label: 'Verified Rooms', value: '3,800+', icon: Building2, desc: 'Direct owner listings' },
  { label: 'Matches Made', value: '8,200+', icon: Sparkles, desc: 'Powered by our algorithm' },
  { label: 'Success Rate', value: '98.4%', icon: ThumbsUp, desc: 'Highly compatible flatmates' },
]

export const featureItems = [
  {
    title: 'AI Compatibility Score',
    description: 'Our advanced algorithm calculates a compatibility percentage based on budget, lifestyle habits, and routines.',
    icon: Bot,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    title: 'Verified Profiles Only',
    description: 'No spam or fake accounts. All users undergo phone and email verification to ensure safety.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Private Real-Time Chat',
    description: 'Connect and chat directly with owners or potential flatmates only after an interest request is accepted.',
    icon: MessageCircle,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Smart Location Search',
    description: 'Filter rooms near IT parks, colleges, or specific hubs in Pune like Hinjewadi, Kharadi, and Kothrud.',
    icon: Search,
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Instant Email Alerts',
    description: 'Get notified immediately when someone shows interest in your listing or accepts your request.',
    icon: Mail,
    color: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Comprehensive Dashboards',
    description: 'Manage listings, edit tenant profiles, view received requests, and track chats from one dashboard.',
    icon: LayoutGrid,
    color: 'from-violet-500 to-fuchsia-600',
  },
  {
    title: 'Zero Brokerage Fees',
    description: 'Connect directly tenant-to-tenant or owner-to-tenant. Absolutely no hidden brokerage fees.',
    icon: CircleDollarSign,
    color: 'from-teal-500 to-emerald-600',
  },
  {
    title: 'Safety First Design',
    description: 'Your contact details remain private. Share your phone number only when you feel comfortable.',
    icon: Lock,
    color: 'from-slate-700 to-slate-900',
  },
]

export const timelineSteps = [
  {
    title: 'Post a Room / Set Preferences',
    description: 'Owners list their rooms with rent & images. Tenants create profiles describing their lifestyle, budget, and ideal flatmate.',
    icon: House,
  },
  {
    title: 'AI Computes Matches',
    description: 'Our matching engine runs instantly, scoring listings based on compatibility factors like sleep cycle, smoking, food habits, and more.',
    icon: BrainCircuit,
  },
  {
    title: 'Send Interest Request',
    description: 'Browse rooms with high match scores. Send an interest request with one click to connect with the owner or current tenants.',
    icon: HeartHandshake,
  },
  {
    title: 'Chat & Move In',
    description: 'Once they accept, your secure chat window opens. Discuss details, visit the property, sign the agreement, and move in!',
    icon: Zap,
  },
]

export const featuredListings = [
  {
    title: 'Luxury Studio near IT Park',
    location: 'Hinjewadi Phase 1, Pune',
    rent: '₹12,500',
    furnishing: 'Fully Furnished',
    score: '96%',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
    beds: '1 BHK',
    baths: '1 Bath',
    area: '550 sq ft',
    tag: 'Popular',
  },
  {
    title: 'Premium Single Room in Flat',
    location: 'Koregaon Park, Pune',
    rent: '₹16,000',
    furnishing: 'Fully Furnished',
    score: '92%',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    beds: '1 Room in 3BHK',
    baths: 'Shared Bath',
    area: '250 sq ft',
    tag: 'Premium Area',
  },
  {
    title: 'Spacious 2BHK Apartment',
    location: 'Baner, Pune',
    rent: '₹22,000',
    furnishing: 'Semi Furnished',
    score: '89%',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
    beds: '2 BHK Flat',
    baths: '2 Bath',
    area: '1,100 sq ft',
    tag: 'Best Value',
  },
  {
    title: 'Cozy PG Double Sharing Room',
    location: 'Kothrud, Pune',
    rent: '₹7,500',
    furnishing: 'Furnished',
    score: '94%',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
    beds: 'Shared Room',
    baths: 'Attached Bath',
    area: '300 sq ft',
    tag: 'Student Friendly',
  },
  {
    title: 'Modern Room with Balcony',
    location: 'Viman Nagar, Pune',
    rent: '₹13,000',
    furnishing: 'Fully Furnished',
    score: '91%',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    beds: 'Master Room',
    baths: 'Private Bath',
    area: '280 sq ft',
    tag: 'Top Rated',
  },
  {
    title: 'Private Room near EON IT Park',
    location: 'Kharadi, Pune',
    rent: '₹11,000',
    furnishing: 'Semi Furnished',
    score: '88%',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    beds: '1 Room in 2BHK',
    baths: 'Private Bath',
    area: '220 sq ft',
    tag: 'IT Professional PG',
  },
]

export const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at TCS',
    rating: 5,
    quote: 'The AI compatibility feature was spot on. I found a roommate who shares my sleep schedule, loves quiet weekends, and is incredibly neat. Saved me weeks of searching!',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Flat Owner, Baner',
    rating: 5,
    quote: 'As an owner, finding reliable tenants is stress-free now. I can pre-qualify tenants through their compatibility score and chat directly in the app. No annoying broker calls!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: 'Aditi Joshi',
    role: 'Student at Symbiosis',
    rating: 5,
    quote: 'Being new to Pune, I was super nervous. RoomSync helped me find a budget-friendly room in Viman Nagar and three amazing flatmates who are now my best friends.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: 'Vikram Mehta',
    role: 'Product Designer',
    rating: 5,
    quote: 'This app feels like a premium modern product. Seamless interface, accurate matching, and absolute privacy control. Highly recommend it to anyone moving to Pune!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
]

export const faqs = [
  {
    question: 'How does the AI Compatibility Score work?',
    answer: 'When you create a profile, you select lifestyle habits (sleep schedule, smoking preference, food habits, cleanliness, budget, etc.). Our matching algorithm compares these choices with other profiles/listings and outputs a percentage score explaining specifically why you fit well or what mismatches exist.',
  },
  {
    question: 'Is my personal contact information safe?',
    answer: 'Absolutely. Your phone number, email address, and exact flat location are never shown publicly. Other users can only contact you through our in-app chat after both parties have accepted the interest request.',
  },
  {
    question: 'Is listing a property free for owners?',
    answer: 'Yes! Listing rooms and managing tenant interest requests is 100% free. There are no brokerage fees, platform fees, or hidden charges. We want to make room hunting directly accessible for everyone.',
  },
  {
    question: 'Can I list shared rooms or PG rooms?',
    answer: 'Yes, our platform supports single private rooms, shared rooms, PG layouts, and full apartments. You can configure the specific bedroom/bathroom counts and select whether it is double, triple, or single occupancy.',
  },
  {
    question: 'What happens when I show interest in a listing?',
    answer: 'The listing owner will receive a real-time notification and see your request in their dashboard (along with your compatibility score). If they approve, a secure chat channel is unlocked instantly, and you can chat directly.',
  },
]

export const heroFloatingCards = [
  { label: 'AI Match Score', value: '96%', icon: Bot },
  { label: 'Rent', value: '₹12,500', icon: CircleDollarSign },
  { label: 'Location', value: 'Hinjewadi, Pune', icon: MapPin },
  { label: 'Furnishing', value: 'Fully Furnished', icon: BadgeCheck },
  { label: 'Status', value: 'Ready to Move', icon: Clock3 },
]
