import React, { useState } from 'react';
import { Star, ShieldCheck, Heart, Plus, ExternalLink, X, Award, CheckCircle2 } from 'lucide-react';
import { TestimonialItem } from '../types';

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Alexander Vlastimil',
    role: 'VIP Yield Staker',
    location: 'Prague, Czech Republic',
    category: 'vip',
    rating: 5,
    stakedAsset: '25,000 USDT (VIP Plan)',
    earnings: '+$11,250 earned in 14 days',
    avatarBg: 'from-amber-500 to-orange-600',
    avatarInitials: 'AV',
    quote: 'I was highly skeptical about dynamic yield staking platforms, but Nexo Finance exceeded all audited standards. Staking 25k USDT on their 14-day VIP program returned exactly 45.00% daily-compounded yield. Instant withdrawal cleared in under 3 minutes!',
    verifiedDate: 'Verified 2 days ago',
    likes: 42,
    auditTxHash: '0x3f5c88da1b98a0c5c68932efbc124977aa5d2041',
    programDuration: '14-Day VIP Fixed',
  },
  {
    id: 't-2',
    name: 'Elena Rostova',
    role: 'Verified Pro Allocator',
    location: 'Berlin, Germany',
    category: 'crypto',
    rating: 5,
    stakedAsset: '12.5 ETH (Pro Plan)',
    earnings: '+3.75 ETH yield secured',
    avatarBg: 'from-blue-500 to-indigo-600',
    avatarInitials: 'ER',
    quote: "The visual transparency of Nexo's ledger on both mobile and desktop is stellar. My KYC took 5 minutes to approve, and my daily staking profits are credited right on time. Highly recommended for locking in consistent high-yield crypto gains.",
    verifiedDate: 'Verified 3 days ago',
    likes: 38,
    auditTxHash: '0x7a8d3e211bb49fbc21008e31fc5d6f6e91da22cc',
    programDuration: '30-Day Ethereum Pro',
  },
  {
    id: 't-3',
    name: 'Marcus K. Thorne',
    role: 'Elite Tier Liquidity Provider',
    location: 'London, United Kingdom',
    category: 'institutional',
    rating: 5,
    stakedAsset: '50,000 USDC (Elite Plan)',
    earnings: '+$17,500 dynamic return',
    avatarBg: 'from-emerald-400 to-teal-600',
    avatarInitials: 'MT',
    quote: 'An incredibly secure, clean, and professional interface. Having our investments backed by institutional multi-sig custody wallets gives immense peace of mind. The Auditor Desk tab lets me inspect everything in real-time.',
    verifiedDate: 'Verified 4 days ago',
    likes: 56,
    auditTxHash: '0x4b92cf88ad99a1e204c332efbb125f448da2ff82',
    programDuration: '21-Day Elite Custody',
  },
  {
    id: 't-4',
    name: 'Sarah Jenkins',
    role: 'E-commerce Business Owner',
    location: 'Seattle, United States',
    category: 'payout',
    rating: 5,
    stakedAsset: '15,000 USDC (7-Day Program)',
    earnings: '+$4,500 claimed & disbursed',
    avatarBg: 'from-purple-500 to-pink-600',
    avatarInitials: 'SJ',
    quote: 'My financial advisor recommended taking a look at alternative yield strategies. I started with a small test of 2,000 USDC on the 7-day program. The interface was extremely clear, and seeing the interest accumulate hourly gave me the confidence to move over a larger portion. I requested a direct bank disbursal last Thursday at 10 AM, and the wire hit my Chase account by 2:30 PM. No gimmicks, just clean execution.',
    verifiedDate: 'Verified 5 days ago',
    likes: 67,
    auditTxHash: '0x1d95ee88cf77b9d20c58eefbb55aa882cfa232b5',
    programDuration: '7-Day Stable Liquidity',
  },
  {
    id: 't-5',
    name: 'Liam van der Westhuizen',
    role: 'Senior Systems Architect',
    location: 'Cape Town, South Africa',
    category: 'crypto',
    rating: 5,
    stakedAsset: '42,000 USDT (VIP Staking)',
    earnings: '+$18,900 dynamic payout',
    avatarBg: 'from-cyan-500 to-blue-600',
    avatarInitials: 'LW',
    quote: "I've been staking on various DeFi platforms since 2020 and grew tired of smart contract risk, gas fee spikes, and volatile APYs. Nexo's fixed-yield VIP tiers offer a refreshing layer of predictability. Having transparent on-chain auditor reports is a major plus.",
    verifiedDate: 'Verified 6 days ago',
    likes: 81,
    auditTxHash: '0x9c3d4a211ba9cfbc55aa12a2dfc88a91ec82bb04',
    programDuration: '14-Day VIP Fixed',
  },
  {
    id: 't-6',
    name: 'Amélie Roche',
    role: 'Freelance UI/UX Designer',
    location: 'Lyon, France',
    category: 'payout',
    rating: 5,
    stakedAsset: '8,500 USDT (Pro Plan)',
    earnings: '+$2,975 yield verified',
    avatarBg: 'from-rose-500 to-red-600',
    avatarInitials: 'AR',
    quote: 'As a freelance designer, having liquid capital sit in a traditional savings account earning 0.1% was frustrating. Putting 8,500 USDT in the Pro plan completely changed my passive income stream. I earn enough daily yields to cover my weekly grocery bills. Already completed three hassle-free withdrawals to my private Ledger wallet.',
    verifiedDate: 'Verified 1 week ago',
    likes: 54,
    auditTxHash: '0x2e8f11ba77a8c9fbcc55aa31efbb1d5f448da2ffc',
    programDuration: '10-Day Pro Accumulator',
  },
  {
    id: 't-7',
    name: 'Hiroto Kobayashi',
    role: 'Private Equity Analyst',
    location: 'Osaka, Japan',
    category: 'vip',
    rating: 5,
    stakedAsset: '1.2 BTC (VIP Bitcoin Plan)',
    earnings: '+0.36 BTC accrued profit',
    avatarBg: 'from-emerald-500 to-lime-600',
    avatarInitials: 'HK',
    quote: 'Was initially hesitant due to the high yields offered, but after reading their SOC-2 security reports and verifying their multi-sig cold storage structure, I decided to allocate a portion of my portfolio. The support team also answered my query about tax reporting within 10 minutes on a Sunday night.',
    verifiedDate: 'Verified 1 week ago',
    likes: 49,
    auditTxHash: '0x6f3e44a11ba9c04355aa12bfcc228a88dc82b842',
    programDuration: '14-Day BTC Sovereign',
  },
  {
    id: 't-8',
    name: 'Carlos Mendoza',
    role: 'E-commerce Consultant',
    location: 'Monterrey, Mexico',
    category: 'payout',
    rating: 5,
    stakedAsset: '14,200 USDT (Pro Plan)',
    earnings: '+$4,970 claimed & cleared',
    avatarBg: 'from-amber-400 to-yellow-600',
    avatarInitials: 'CM',
    quote: "What I love most is the zero-fee withdrawal structure. Other platforms eat up your interest with hidden gas or processing fees, but here, the $14,200 payout I requested cleared in full. The Ledger-verified transfer details match exactly what was shown in my dashboard.",
    verifiedDate: 'Verified 2 weeks ago',
    likes: 61,
    auditTxHash: '0x8c7211da33b9c8fbc21008e31efcc32f548da2ff8',
    programDuration: '10-Day Pro Accumulator',
  },
  {
    id: 't-9',
    name: 'Arthur Pendelton & Mia Lin',
    role: 'Agency Co-Founders',
    location: 'Singapore',
    category: 'institutional',
    rating: 5,
    stakedAsset: '100,000 USDT (Corporate Vault)',
    earnings: '+$45,000 corporate yield',
    avatarBg: 'from-blue-600 to-cyan-700',
    avatarInitials: 'AM',
    quote: 'We shifted a small chunk of our digital agency’s cash reserves into the Institutional Corporate Vault. The multi-sig withdrawal guards work beautifully – my partner and I both have to approve transfers via our authenticators before they execute. Yield is paid out exactly on schedule.',
    verifiedDate: 'Verified 2 weeks ago',
    likes: 92,
    auditTxHash: '0x4b7c1a88df9fa1c5c68932efcc12a977aa5d2042',
    programDuration: '21-Day Institutional Vault',
  },
  {
    id: 't-10',
    name: "Margaret O'Reilly",
    role: 'Retired Educator',
    location: 'Cork, Ireland',
    category: 'payout',
    rating: 5,
    stakedAsset: '5,000 USDT (Basic Program)',
    earnings: '+$1,500 yield verified',
    avatarBg: 'from-teal-500 to-emerald-600',
    avatarInitials: 'MO',
    quote: 'As a retired teacher, I was looking for a simple, high-yield digital asset solution to supplement my pension. My son helped me set up my first 5k program here. The daily updates are clear, and I love the light mode theme because it is very easy to read.',
    verifiedDate: 'Verified 3 weeks ago',
    likes: 41,
    auditTxHash: '0x5d9eee88cf77b0d20c58eefbb55aa882cfa232b5',
    programDuration: '7-Day Basic Yield',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Audits' },
  { id: 'vip', label: 'VIP Programs' },
  { id: 'crypto', label: 'Crypto & ETH' },
  { id: 'institutional', label: 'Institutional' },
  { id: 'payout', label: 'Fast Payouts' },
];

export const Testimonials: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Modal Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'all' | 'vip' | 'crypto' | 'institutional' | 'payout'>('vip');
  const [stakedAsset, setStakedAsset] = useState('');
  const [earnings, setEarnings] = useState('');
  const [programDuration, setProgramDuration] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);

  const handleLike = (id: string) => {
    setLikesMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quote) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'VI';

    const bgGradients = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    const avatarBg = bgGradients[Math.floor(Math.random() * bgGradients.length)];
    const auditTxHash = `0x${Math.floor(Math.random() * 1e8).toString(16).padEnd(40, 'a')}`;

    const newReview: TestimonialItem = {
      id: `t-custom-${Date.now()}`,
      name,
      role: role || 'Verified Investor',
      location: location || 'Global Client',
      category,
      rating,
      stakedAsset: stakedAsset || '12,500 USDT (Pro program)',
      earnings: earnings || '+$4,375 yield verified',
      avatarBg,
      avatarInitials: initials,
      quote,
      verifiedDate: 'Verified just now',
      likes: 1,
      auditTxHash,
      programDuration: programDuration || '10-Day Pro Accumulator',
    };

    setTestimonials([newReview, ...testimonials]);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setIsModalOpen(false);
      setName('');
      setRole('');
      setLocation('');
      setStakedAsset('');
      setEarnings('');
      setProgramDuration('');
      setQuote('');
    }, 1500);
  };

  const filteredList =
    activeCategory === 'all'
      ? testimonials
      : testimonials.filter((t) => t.category === activeCategory);

  return (
    <section className="space-y-6 pt-6" id="testimonials-section">
      {/* Title and Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audited Wall of Love (Dense Grid)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Stakers & Verified Payouts
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl mt-1">
            Real clients who locked capital in Nexo's automated high-yield vaults and successfully claimed daily rewards.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-add-verified-review"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-[#00FFB2] hover:bg-[#00E59E] text-black transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Review</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-[#00FFB2] dark:text-black shadow-sm'
                : 'bg-slate-100 dark:bg-gray-900/60 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item) => {
          const totalLikes = item.likes + (likesMap[item.id] || 0);

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition duration-200 hover:shadow-xl ${
                theme === 'dark'
                  ? 'bg-[#111622]/80 border-gray-800/80 hover:border-gray-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-md`}
                    >
                      {item.avatarInitials}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#00FFB2]" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400">
                        {item.role} • {item.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400 text-xs">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Staked stats badge */}
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                    theme === 'dark'
                      ? 'bg-gray-950/60 border-gray-800 text-gray-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Allocation</span>
                    <span className="font-bold text-slate-800 dark:text-white">{item.stakedAsset}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Net Payout</span>
                    <span className="font-extrabold text-emerald-500">{item.earnings}</span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xs md:text-sm text-slate-600 dark:text-gray-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <Award className="w-3.5 h-3.5 text-[#00FFB2]" />
                  <span>{item.auditTxHash.substring(0, 10)}...</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px]">{item.verifiedDate}</span>
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1 text-slate-500 dark:text-gray-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${(likesMap[item.id] || 0) > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{totalLikes}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Adding Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border relative ${
              theme === 'dark' ? 'bg-[#161B27] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00FFB2]" />
                <span>Submit Verified Staking Experience</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Your review will be cryptographically anchored to your on-chain settlement ledger.
              </p>
            </div>

            {showSuccessToast ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#00FFB2] mx-auto animate-bounce" />
                <h4 className="font-black text-lg">Review Verified & Anchored!</h4>
                <p className="text-xs text-gray-400">Added to the public ledger audit feed.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Role / Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Institutional Allocator"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Zurich, Switzerland"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    >
                      <option value="vip">VIP Program</option>
                      <option value="crypto">Crypto & ETH</option>
                      <option value="institutional">Institutional</option>
                      <option value="payout">Fast Payouts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Staked Asset & Tier</label>
                    <input
                      type="text"
                      placeholder="e.g. 20,000 USDT (VIP Plan)"
                      value={stakedAsset}
                      onChange={(e) => setStakedAsset(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Net Earnings / Return</label>
                    <input
                      type="text"
                      placeholder="e.g. +$8,500 claimed"
                      value={earnings}
                      onChange={(e) => setEarnings(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Your Detailed Experience & Findings</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your yield accrual, time to withdraw, customer support response, and platform security..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00FFB2]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
                  >
                    Publish Verified Audit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
export default Testimonials;
