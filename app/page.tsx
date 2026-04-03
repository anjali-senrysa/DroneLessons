'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window { Razorpay: any; }
}

const BUNDLE_BASE = 2249;
const GST = 0.18;
const WA = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '919999999999'}`;
const fmt = (n: number) => n.toLocaleString('en-IN');
const calcGst = (sub: number) => { const g = Math.round(sub * GST); return { sub, g, total: sub + g }; };

const FAQS = [
  { q: 'Who can join HoverMethod Junior?', a: 'Students from Class 7 to Class 12. No prior knowledge of drones or technology is required.' },
  { q: 'Is the ₹2,249 programme live or pre-recorded?', a: 'It is a fully live, instructor-led online programme. Every session is conducted in real time. Recordings may be shared after each session.' },
  { q: 'Is the practical session compulsory?', a: 'No. Both the Practical Camp and the CoE Experience are fully optional.' },
  { q: 'What does the Practical Camp include?', a: 'A guided 3-hour practical session covering how drones are set up, a walkthrough of real drone components, supervised hands-on orientation, and practical explanation of flight systems.' },
  { q: 'Can the Practical Camp be at our school?', a: 'Yes. If 60 or more students from the same school opt for the Practical Camp, the session can be organised at the school campus.' },
  { q: 'What is the CoE Experience?', a: 'An optional premium 4-hour hands-on session at the Senrysa Drone Center of Excellence at IIT Research Park. Priced separately at ₹3,249 per student.' },
  { q: 'Is the CoE experience included in the ₹2,249 fee?', a: 'No. The CoE Experience is a separate, optional premium add-on priced at ₹3,249 per student.' },
  { q: 'What device does my child need?', a: 'A laptop or desktop is recommended for simulator sessions. A smartphone is sufficient for theory sessions.' },
  { q: 'Will students receive a certificate?', a: 'Yes. Students receive a digital completion certificate upon finishing the programme.' },
  { q: 'How do we enrol?', a: 'Click any Enrol button on this page to pay directly, or reach us on WhatsApp. Batch dates are confirmed after payment.' },
];

const CURRICULUM = [
  { day: 1, color: 'linear-gradient(135deg,#133f56,#1a5270)', label: 'Day 1 · 2 Hours · Live Online', title: 'Welcome to the World of Drones', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'What drones are, where they came from, and why they matter right now in India.', points: ['What is a UAV? — Types: multirotor, fixed-wing, hybrid VTOL.', 'Applications in India — Agriculture, mapping, logistics, disaster response.', 'History of Drones — Military origins to consumer use.', 'India Drone Policy — DGCA overview, Digital Sky Platform.', 'The HoverMethod Roadmap — What the 7 sessions cover.'], outcome: 'Students can identify drone types, explain applications in India, and articulate why drone careers matter.' },
  { day: 2, color: 'linear-gradient(135deg,#064e3b,#065f46)', label: 'Day 2 · 2 Hours · Live Online', title: 'How Drones Fly — The Physics', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'The science of flight explained simply. No equations — just intuition and real understanding.', points: ['Four Forces of Flight — Lift, Thrust, Drag, Weight.', "Newton's Laws in Action — Every drone movement through propeller spin.", 'Pitch, Roll, Yaw and Throttle — The four fundamental movements.', 'Counter-Rotating Motors — Why CW and CCW motors are needed.', 'How Stability is Achieved — Introduction to the flight controller.'], outcome: 'Students can explain all four forces, demonstrate pitch/roll/yaw, and describe counter-rotating motors.' },
  { day: 3, color: 'linear-gradient(135deg,#431407,#7c2d12)', label: 'Day 3 · 2 Hours · Live Online', title: 'Inside the Machine — Drone Hardware', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'A component-by-component walkthrough. What each part does and how they connect.', points: ['Frame — Materials, arm configurations, wheelbase effects.', 'Brushless Motors — How a 3-phase motor works, KV rating.', 'ESC, Propellers and LiPo Battery — Speed controllers, mAh, C-rating.', 'Flight Controller — The brain. PID loop. Firmware: ArduPilot, Betaflight.'], outcome: 'Students can name every component, understand specs like KV, mAh, C-rating, and trace power flow.' },
  { day: 4, color: 'linear-gradient(135deg,#1e1b4b,#312e81)', label: 'Day 4 · 2 Hours · Live Online', title: 'Sensors & the Intelligence Layer', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'How six sensors work together to keep a drone stable and aware of its environment.', points: ['Gyroscope and Accelerometer — Measuring rotation and linear acceleration.', 'Magnetometer and Barometer — Compass heading and altitude.', 'IMU and Sensor Fusion — How the Inertial Measurement Unit combines sensors.', 'PID Control Loop — How the FC corrects the drone every few milliseconds.'], outcome: "Students explain each sensor's role, describe sensor fusion intuitively, and understand PID." },
  { day: 5, color: 'linear-gradient(135deg,#0f3460,#1a5276)', label: 'Day 5 · 2 Hours · Live Online', title: 'GPS, Navigation & Autonomous Flight', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'How drones know exactly where they are and navigate without a pilot.', points: ['How GPS Works — Satellites, triangulation, HDOP. Why 6+ satellites needed.', 'Flight Modes — Stabilize, Altitude Hold, Loiter, Return to Launch, Auto.', 'Waypoint Navigation and GCS — Programmed flight paths. Mission Planner demo.', 'Geofencing and Digital Sky — Virtual boundaries, DGCA compliance.'], outcome: 'Students understand GPS-enabled autonomous flight and mission-controlled operations.' },
  { day: 6, color: 'linear-gradient(135deg,#3d1a6a,#6b21a8)', label: 'Day 6 · 2 Hours · Live Online', title: 'Safety, DGCA Rules & Simulator Flying', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: 'Everything a responsible drone operator must know — and the first time students fly using a simulator.', points: ['DGCA Drone Rules 2021 — Green, Yellow, Red airspace zones.', 'Drone Categories and RPL — Nano to Large. Remote Pilot Licence.', '12-Point Pre-Flight Checklist — Battery, GPS lock, compass calibration.', 'Simulator Practice Session 1 — Controls: hovering, movements, muscle memory.'], outcome: 'Students complete a pre-flight checklist from memory and demonstrate basic hover in the simulator.' },
  { day: 7, color: 'linear-gradient(135deg,#0d4a30,#166534)', label: 'Day 7 · 2 Hours · Live Online', title: 'Careers, Industry & Practical Briefing', tag: 'Online', tagBg: '#F0F9FF', tagColor: '#0369A1', tagBorder: '#E0F2FE', desc: "India's drone industry, career paths, advanced simulator practice, and full briefing for the hands-on day.", points: ['India Drone Industry — Market growing to Rs 15,000 crore by 2030.', 'Career Paths — Remote Pilot, UAV Engineer, Drone Data Analyst.', 'Advanced Simulator Practice — Figure-8 patterns, emergency landings.', 'Build Camp Briefing — Full Day 8 walkthrough and component kit.', 'Certificate and Q&A — Open question session. Certificate issued.'], outcome: 'Students are fully briefed for Day 8 and can articulate 3+ drone career paths.' },
  { day: 8, color: 'linear-gradient(135deg,#1a3a0a,#2d5a14)', label: 'Day 8 · Full Day · Practical Camp (Optional Add-On)', title: 'Build a Real Drone from Scratch — Then Fly It', tag: 'Hands-On', tagBg: '#F0FDF4', tagColor: '#166534', tagBorder: '#BBF7D0', desc: 'Students arrive with 7 sessions of theory. They leave having assembled a working quadcopter and flown it under supervision.', points: ['Safety Briefing — LiPo handling, propeller protocol. Groups of 4-5.', 'Kit Unboxing — F450 frame, 1000KV motors, 30A ESCs, Pixhawk FC, GPS, LiPo.', 'Frame Assembly — Arms to centre plate, standoffs, landing gear.', 'Motor Mounting and CW/CCW Assignment — Motor pairing, wire routing.', 'First Power-Up and Calibration — Mission Planner setup.', 'Supervised First Hover — Goal: stable 1-metre hover. All groups fly.'], outcome: '🎉 Students leave with: build experience + certificate + component card + Mission Planner flight log.' },
];

const WA_SVG = (
  <svg style={{ width: 15, height: 15, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Add this helper function above your component
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function HoverMethodPage() {
  const [bundle, setBundle] = useState<'a' | 'b'>('a');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openAcc, setOpenAcc] = useState<number | null>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [navShadow, setNavShadow] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState('');
  const [sfInterests, setSfInterests] = useState<string[]>([]);
  const sfSchool = useRef<HTMLInputElement>(null);
  const sfName = useRef<HTMLInputElement>(null);
  const sfPhone = useRef<HTMLInputElement>(null);
  const sfStudents = useRef<HTMLSelectElement>(null);
  const sfMsg = useRef<HTMLTextAreaElement>(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{ amt: number, desc: string } | null>(null);
  const [payName, setPayName] = useState('');
  const [payEmail, setPayEmail] = useState('');
  const [payPhone, setPayPhone] = useState('');

  useEffect(() => {
    const s = () => { setNavShadow(window.scrollY > 40); setShowScroll(window.scrollY > 500); };
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  const bA = calcGst(BUNDLE_BASE + 1249);
  const bB = calcGst(BUNDLE_BASE + 3249);
  const bOnline = calcGst(BUNDLE_BASE);
  const cur = bundle === 'a' ? bA : bB;
  const curName = bundle === 'a' ? 'Practical Camp' : 'CoE Experience';
  const curAddon = bundle === 'a' ? 1249 : 3249;


  const pay = useCallback(async (amtRupees: number, desc: string, customerName = '',
    customerEmail = '',
    customerPhone = '',) => {
    if (paying) return;
    setPaying(true);
    try {
      // ✅ Ensure Razorpay script is loaded first
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Payment SDK failed to load. Please check your connection and try again.');
        setPaying(false);
        return;
      }

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amtRupees * 100 }),
      });
      const order = await res.json();
      if (!order.id) throw new Error(order.error || 'Order failed');

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'HoverMethod Junior',
        description: desc,
        order_id: order.id,

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [{ method: 'upi' }],
              },
              other: {
                name: 'Other Methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: { show_default_blocks: false },
          },
        },

        handler: async (r: any) => {
          const v = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...r,
              customer_name: customerName,
              customer_email: customerEmail,
              amount: amtRupees,
            }),
          });
          const result = await v.json();
          setPaying(false);
          if (result.success) {
            setSuccess('🎉 Payment successful! You are enrolled. Check WhatsApp for batch details.');
            setTimeout(() => setSuccess(''), 7000);
          } else {
            alert('Payment verification failed. Please contact us on WhatsApp.');
          }
        },
        theme: { color: '#f37538' },
        modal: { ondismiss: () => setPaying(false) },
      });

      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();

    } catch (e: any) {
      alert('Something went wrong: ' + e.message);
      setPaying(false);
    }
  }, [paying]);

  const submitSchool = () => {
    const school = sfSchool.current?.value.trim() ?? '';
    const name = sfName.current?.value.trim() ?? '';
    const phone = sfPhone.current?.value.trim() ?? '';
    if (!school || !name || !phone) { alert('Please fill in School Name, Your Name, and Phone.'); return; }
    let txt = `Hi, I represent ${school}.\n\nContact: ${name}\nPhone: ${phone}`;
    if (sfStudents.current?.value) txt += `\nApprox. Students: ${sfStudents.current.value}`;
    if (sfInterests.length) txt += `\nInterested in: ${sfInterests.join(', ')}`;
    if (sfMsg.current?.value.trim()) txt += `\n\nMessage: ${sfMsg.current.value.trim()}`;
    window.open(`${WA}?text=${encodeURIComponent(txt)}`, '_blank');
  };

  return (
    <>
      {success && <div className="pay-success-banner">{success}</div>}

      {/* ANNOUNCE BAR */}
      <div className="announce">
        <span>🚁 Class 6–12 · 7-Day Live Online Drone Technology Programme · Starting at <strong>₹2,249</strong> <i>· Optional Practical Add-Ons Available</i></span>
        <a href={`${WA}?text=Hi%2C+I+want+to+enrol+in+HoverMethod+Junior`} className="ann-pill" target="_blank" rel="noreferrer">Enrol Now →</a>
      </div>

      {/* NAV */}
      <div className="header" id="nav">
        <nav className={`max-w${navShadow ? ' shadow' : ''}`} style={{ padding: '0 32px' }}>
          <div className="nav-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://ik.imagekit.io/unizap/drone/logo.png?tr=w-200" alt="HoverMethod" style={{ height: 44, width: 'auto' }} />
          </div>
          <div className="nav-links">
            <a href="#about" className="nav-link">Programme</a>
            <a href="#curriculum" className="nav-link">Curriculum</a>
            <a href="#enroll" className="nav-link">Fees &amp; Add-Ons</a>
            <a href="#schools" className="nav-link">For Schools</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <a href={`${WA}?text=Hi%2C+I+want+to+enrol+in+HoverMethod+Junior`} className="nav-cta" target="_blank" rel="noreferrer">
            {WA_SVG}
            Enrol <span>on WhatsApp</span>
          </a>
        </nav>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-video-wrap">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video className="hero-vid playing" autoPlay muted loop playsInline>
            <source src="https://ik.imagekit.io/unizap/drone/drone%203.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay" />
        <div className="hero-inner max-w">
          <div className="hero-copy">
            <div className="hero-eyebrow"><span className="live-dot" />Now Enrolling &nbsp;·&nbsp; Class 6–12</div>
            <h1 className="hero-h1">
              <span className="word-row"><span className="word" style={{ animationDelay: '.45s' }}>Build&nbsp;</span><span className="word" style={{ animationDelay: '.55s' }}>Your&nbsp;</span><span className="word" style={{ animationDelay: '.65s' }}>First</span></span>
              <span className="word-row"><span className="word" style={{ animationDelay: '.80s' }}>Foundation&nbsp;</span><span className="word" style={{ animationDelay: '.90s' }}>in</span></span>
              <span className="word-row"><em className="word" style={{ animationDelay: '1.05s' }}>Drone&nbsp;</em><em className="word" style={{ animationDelay: '1.15s' }}>Technology.</em></span>
            </h1>
            <div className="hero-price-block">
              <div className="hero-price-main"><span className="hp-rs">₹</span><span className="hp-amt">2,249</span><span className="hp-gst">&nbsp;+ GST</span></div>
              <div className="hp-divider" />
              <div className="hp-tagline"><strong>Starting price</strong>7 Days Live Online<br />Add-ons optional</div>
            </div>
            <div className="hero-badges">
              <span className="hb">7 Days × 2 Hours Live</span>
              <span className="hb">Beginner Friendly</span>
              <span className="hb">Class 6–12</span>
              <span className="hb accent">Certificate Included</span>
            </div>
            <div className="hero-actions">
              <a href="#enroll" className="btn-primary">Enrol Now</a>
              <a href="#curriculum" className="btn-outline">See 7-Day Curriculum ↓</a>
            </div>
            <p className="hero-support">Online foundation at ₹2,249. Optionally add a <strong>Practical Camp</strong> in your city or a premium <strong>IIT Research Park visit</strong> — choose what works for you.</p>
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      <section id="instructors">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="sec-title">Designed &amp; Delivered by<br /><em>IIT Alumni with Real-World Expertise.</em></h2>
            <p className="sec-sub" style={{ margin: '0 auto', maxWidth: 580 }}>HoverMethod Junior is built by engineering professionals who have worked inside the systems — from defence technology to drone R&amp;D — and know how to explain it to beginners.</p>
          </div>
          <div className="instructor-grid">
            <div className="instr-card">
              <div className="instr-avatar" style={{ background: 'linear-gradient(135deg,#f37538,#d4622a)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ik.imagekit.io/unizap/drone/soumyajyoti_basu.png?updatedAt=1774965979255" alt="Soumyajyoti" />
                <div className="instr-avatar-ring" />
              </div>
              <h3 className="instr-name">Soumyajyoti Basu</h3>
              <div className="instr-role">BE &amp; M.Tech Aeronautical Engg · IIT Kharagpur · IIM Calcutta</div>
              <div className="instr-story"><p>IIT Kharagpur-trained aerospace professional with exposure to advanced drone and unmanned systems. As Programme Co-Designer and Live Instructor, he helps students build a strong foundation in drone flight, system design, and real-world aerial technology applications.</p></div>
              <div className="instr-tags">
                <span className="itag">BE &amp; M.Tech Aeronautical Engg</span>
                <span className="itag">IIT Kharagpur</span>
                <span className="itag">IIM Calcutta</span>
                <span className="itag">Aerospace &amp; UAV Systems</span>
                <span className="itag">Live Instructor</span>
              </div>
            </div>
            <div className="instr-card">
              <div className="instr-avatar" style={{ background: 'linear-gradient(135deg,#0e2e3d,#133f56)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ik.imagekit.io/unizap/drone/dr_manoj.jpeg" alt="Dr Manoj" />
                <div className="instr-avatar-ring" style={{ borderColor: 'rgba(19,63,86,.4)' }} />
              </div>
              <h3 className="instr-name">Dr. Manoj Sharma</h3>
              <div className="instr-role">PhD AI/ML &amp; Computer Vision · IIT Kharagpur</div>
              <div className="instr-story"><p>AI and computer vision specialist with a PhD from IIT Kharagpur and experience in applied intelligent systems. As Programme Co-Designer and Live Instructor, he brings depth to drone sensing, simulation, autonomy, and the AI technologies shaping the future of unmanned platforms.</p></div>
              <div className="instr-tags">
                <span className="itag iit">PhD AI/ML &amp; Computer Vision</span>
                <span className="itag iit">IIT Kharagpur</span>
                <span className="itag iit">Senrysa Technologies</span>
                <span className="itag iit">Drone Autonomy &amp; AI</span>
                <span className="itag iit">Live Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-visual">
              <svg width="100%" viewBox="0 0 680 900" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="bg2" cx="50%" cy="45%" r="65%"><stop offset="0%" stopColor="#0d2645" /><stop offset="100%" stopColor="#05090f" /></radialGradient>
                  <radialGradient id="cg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1a6bb5" stopOpacity="0.4" /><stop offset="100%" stopColor="#0a2a4a" stopOpacity="0" /></radialGradient>
                  <linearGradient id="db2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a5fa8" /><stop offset="100%" stopColor="#112b56" /></linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1c4a8a" /><stop offset="100%" stopColor="#0e2444" /></linearGradient>
                  <linearGradient id="af2" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#29d4ff" /><stop offset="100%" stopColor="#3be08a" /></linearGradient>
                  <linearGradient id="sf2" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#29d4ff" /><stop offset="100%" stopColor="#1a90cc" /></linearGradient>
                  <linearGradient id="bf2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3be08a" /><stop offset="100%" stopColor="#1ab567" /></linearGradient>
                  <linearGradient id="hl2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#29d4ff" stopOpacity="0" /><stop offset="50%" stopColor="#29d4ff" stopOpacity="0.7" /><stop offset="100%" stopColor="#29d4ff" stopOpacity="0" /></linearGradient>
                  <clipPath id="sc2"><rect x="240" y="612" width="200" height="148" /></clipPath>
                  <style>{`
                    @keyframes pS{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                    @keyframes dH{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
                    @keyframes p1{0%{r:30;opacity:.6}100%{r:180;opacity:0}}
                    @keyframes p2{0%{r:30;opacity:.5}100%{r:180;opacity:0}}
                    @keyframes hP{0%,100%{opacity:.7}50%{opacity:1}}
                    @keyframes sL{0%{transform:translateY(0px);opacity:.8}80%{transform:translateY(140px);opacity:.6}100%{transform:translateY(140px);opacity:0}}
                    @keyframes nW{0%,100%{transform:rotate(0deg)}30%{transform:rotate(6deg)}70%{transform:rotate(-4deg)}}
                    @keyframes pP{0%{r:6;opacity:.8}100%{r:20;opacity:0}}
                    @keyframes dF{0%,95%,100%{opacity:1}96%{opacity:.4}97%{opacity:1}98%{opacity:.6}}
                    @keyframes pD{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
                    .ptl2{transform-origin:220px 330px;animation:pS .18s linear infinite}
                    .ptr2{transform-origin:460px 330px;animation:pS .15s linear infinite reverse}
                    .pbl2{transform-origin:220px 530px;animation:pS .16s linear infinite reverse}
                    .pbr2{transform-origin:460px 530px;animation:pS .17s linear infinite}
                    .dg2{transform-origin:340px 430px;animation:dH 3.2s ease-in-out infinite}
                    .pr1{transform-origin:340px 430px;animation:p1 2.4s ease-out infinite}
                    .pr2{transform-origin:340px 430px;animation:p2 2.4s ease-out infinite .8s}
                    .hp2{animation:hP 2s ease-in-out infinite}
                    .sl2{animation:sL 2s ease-in-out infinite 1s}
                    .nd2{transform-origin:570px 200px;animation:nW 4s ease-in-out infinite}
                    .pp2{transform-origin:340px 695px;animation:pP 1.8s ease-out infinite}
                    .df2{animation:dF 5s ease-in-out infinite}
                    .pd2{stroke-dasharray:200;animation:pD 2.5s ease-out forwards .5s;stroke-dashoffset:200}
                  `}</style>
                </defs>
                <rect width="680" height="900" fill="url(#bg2)" rx="16" />
                <ellipse cx="340" cy="430" rx="200" ry="180" fill="url(#cg2)" />
                <circle className="pr1" cx="340" cy="430" r="30" fill="none" stroke="#29d4ff" strokeWidth="1.2" opacity="0.6" />
                <circle className="pr2" cx="340" cy="430" r="30" fill="none" stroke="#29d4ff" strokeWidth="1" opacity="0.5" />
                {/* DRONE GROUP */}
                <g className="dg2">
                  <rect x="205" y="330" width="118" height="10" rx="5" fill="url(#ag2)" transform="rotate(-42 263 335)" />
                  <rect x="357" y="330" width="118" height="10" rx="5" fill="url(#ag2)" transform="rotate(42 417 335)" />
                  <rect x="205" y="490" width="118" height="10" rx="5" fill="url(#ag2)" transform="rotate(42 263 495)" />
                  <rect x="357" y="490" width="118" height="10" rx="5" fill="url(#ag2)" transform="rotate(-42 417 495)" />
                  <circle cx="220" cy="330" r="22" fill="#0e2444" stroke="#1c5299" strokeWidth="1.5" />
                  <circle cx="460" cy="330" r="22" fill="#0e2444" stroke="#1c5299" strokeWidth="1.5" />
                  <circle cx="220" cy="530" r="22" fill="#0e2444" stroke="#1c5299" strokeWidth="1.5" />
                  <circle cx="460" cy="530" r="22" fill="#0e2444" stroke="#1c5299" strokeWidth="1.5" />
                  <g className="ptl2"><ellipse cx="220" cy="330" rx="54" ry="6" fill="#1a4a8a" opacity="0.5" /><ellipse cx="220" cy="330" rx="54" ry="6" fill="#1a4a8a" opacity="0.4" transform="rotate(90 220 330)" /></g>
                  <g className="ptr2"><ellipse cx="460" cy="330" rx="54" ry="6" fill="#1a4a8a" opacity="0.5" /><ellipse cx="460" cy="330" rx="54" ry="6" fill="#1a4a8a" opacity="0.4" transform="rotate(90 460 330)" /></g>
                  <g className="pbl2"><ellipse cx="220" cy="530" rx="54" ry="6" fill="#1a4a8a" opacity="0.5" /><ellipse cx="220" cy="530" rx="54" ry="6" fill="#1a4a8a" opacity="0.4" transform="rotate(90 220 530)" /></g>
                  <g className="pbr2"><ellipse cx="460" cy="530" rx="54" ry="6" fill="#1a4a8a" opacity="0.5" /><ellipse cx="460" cy="530" rx="54" ry="6" fill="#1a4a8a" opacity="0.4" transform="rotate(90 460 530)" /></g>
                  <rect x="294" y="394" width="92" height="72" rx="14" fill="url(#db2)" stroke="#2461a8" strokeWidth="1.5" />
                  <circle cx="340" cy="430" r="18" fill="#081420" stroke="#1a4a8a" strokeWidth="1.5" />
                  <circle cx="340" cy="430" r="11" fill="#0d1e35" stroke="#1e5799" strokeWidth="1" />
                  <circle cx="337" cy="427" r="2" fill="#29d4ff" opacity="0.6" />
                  <circle cx="302" cy="402" r="3.5" fill="#29d4ff" opacity="0.9"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" repeatCount="indefinite" /></circle>
                  <circle cx="378" cy="402" r="3.5" fill="#29d4ff" opacity="0.9"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" begin="0.6s" repeatCount="indefinite" /></circle>
                  <circle cx="302" cy="458" r="3.5" fill="#3be08a" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" /></circle>
                  <circle cx="378" cy="458" r="3.5" fill="#3be08a" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="1s" repeatCount="indefinite" /></circle>
                </g>
                {/* HUD */}
                <g className="hp2" stroke="#29d4ff" strokeWidth="1" opacity="0.75">
                  <line x1="308" y1="430" x2="326" y2="430" /><line x1="354" y1="430" x2="372" y2="430" />
                  <line x1="340" y1="406" x2="340" y2="420" /><line x1="340" y1="440" x2="340" y2="454" />
                </g>
                <g stroke="#29d4ff" strokeWidth="1.5" fill="none" opacity="0.85">
                  <path d="M272 378 L272 364 L288 364" /><path d="M408 378 L408 364 L392 364" />
                  <path d="M272 482 L272 496 L288 496" /><path d="M408 482 L408 496 L392 496" />
                </g>
                <rect className="sl2" x="262" y="364" width="156" height="2" rx="1" fill="#29d4ff" opacity="0.7" />
                <rect x="80" y="429" width="520" height="1.5" rx="1" fill="url(#hl2)" opacity="0.45"><animate attributeName="opacity" values="0.45;0.7;0.45" dur="2s" repeatCount="indefinite" /></rect>
                {/* TOP BAR */}
                <rect x="40" y="38" width="600" height="54" rx="10" fill="#0a1e38" stroke="#1a3a60" strokeWidth="1" opacity="0.92" />
                <rect x="58" y="52" width="8" height="8" rx="2" fill="#3be08a" />
                <text fontFamily="monospace" fontSize="11" fill="#3be08a" x="72" y="62">GPS LOCK</text>
                <text fontFamily="monospace" fontSize="11" fill="#29d4ff" x="58" y="80" className="df2">28.6139° N  77.2090° E</text>
                <text fontFamily="monospace" fontSize="13" fill="#29d4ff" x="340" y="60" textAnchor="middle" letterSpacing="3">HOVERMETHOD</text>
                <text fontFamily="monospace" fontSize="10" fill="#3be08a" x="340" y="80" textAnchor="middle">● LIVE NAVIGATION ACTIVE</text>
                <text fontFamily="monospace" fontSize="11" fill="#aac8ef" x="622" y="62" textAnchor="end">MODE: AUTO</text>
                <text fontFamily="monospace" fontSize="11" fill="#29d4ff" x="622" y="80" textAnchor="end" className="df2">SAT: 12 / HDOP: 0.8</text>
                {/* LEFT PANEL */}
                <rect x="40" y="120" width="140" height="270" rx="10" fill="#070f1e" stroke="#132840" strokeWidth="1" opacity="0.93" />
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="110" y="142" textAnchor="middle" letterSpacing="1">ALTITUDE</text>
                <rect x="62" y="155" width="18" height="110" rx="4" fill="#0d1e35" stroke="#1a3550" strokeWidth="0.5" />
                <rect x="62" y="190" width="18" height="75" rx="4" fill="url(#af2)" opacity="0.9"><animate attributeName="height" values="75;80;73;78;75" dur="4s" repeatCount="indefinite" /><animate attributeName="y" values="190;185;192;187;190" dur="4s" repeatCount="indefinite" /></rect>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="86" y="162">120m</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="86" y="188">90m</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="86" y="215">60m</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="86" y="241">30m</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="86" y="268">0m</text>
                <text fontFamily="monospace" fontSize="17" fill="#3be08a" x="110" y="300" textAnchor="middle" className="df2">72m</text>
                <text fontFamily="monospace" fontSize="9" fill="#3be08a" x="110" y="315" textAnchor="middle">AGL</text>
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="110" y="345" textAnchor="middle" letterSpacing="1">H.SPEED</text>
                <text fontFamily="monospace" fontSize="17" fill="#29d4ff" x="110" y="370" textAnchor="middle" className="df2">14.3</text>
                <text fontFamily="monospace" fontSize="9" fill="#29d4ff" x="110" y="385" textAnchor="middle">m/s</text>
                {/* RIGHT PANEL */}
                <rect x="500" y="120" width="140" height="270" rx="10" fill="#070f1e" stroke="#132840" strokeWidth="1" opacity="0.93" />
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="570" y="142" textAnchor="middle" letterSpacing="1">COMPASS</text>
                <circle cx="570" cy="200" r="44" fill="#050d1a" stroke="#1a3a60" strokeWidth="0.8" />
                <text fontFamily="monospace" fontSize="10" fill="#29d4ff" x="570" y="162" textAnchor="middle">N</text>
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="614" y="205" textAnchor="middle">E</text>
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="570" y="248" textAnchor="middle">S</text>
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="526" y="205" textAnchor="middle">W</text>
                <g className="nd2">
                  <polygon points="570,163 565,200 570,195 575,200" fill="#29d4ff" opacity="0.9" />
                  <polygon points="570,237 565,200 570,205 575,200" fill="#1a3a60" />
                </g>
                <circle cx="570" cy="200" r="4" fill="#29d4ff" opacity="0.8" />
                <text fontFamily="monospace" fontSize="14" fill="#29d4ff" x="570" y="271" textAnchor="middle" className="df2">027°</text>
                <text fontFamily="monospace" fontSize="9" fill="#6a9dc8" x="570" y="285" textAnchor="middle">NNE</text>
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="570" y="318" textAnchor="middle" letterSpacing="1">BATTERY</text>
                <rect x="524" y="326" width="92" height="22" rx="4" fill="#050d1a" stroke="#1a3550" strokeWidth="1" />
                <rect x="616" y="331" width="6" height="12" rx="2" fill="#1a3550" />
                <rect x="526" y="328" width="72" height="18" rx="3" fill="url(#bf2)" opacity="0.88"><animate attributeName="width" values="72;70;72;73;72" dur="6s" repeatCount="indefinite" /></rect>
                <text fontFamily="monospace" fontSize="14" fill="#3be08a" x="570" y="372" textAnchor="middle">78%</text>
                <text fontFamily="monospace" fontSize="9" fill="#3be08a" x="570" y="387" textAnchor="middle">22.1V · 4.8Ah</text>
                {/* BOTTOM LEFT: SIGNAL */}
                <rect x="40" y="620" width="200" height="130" rx="10" fill="#070f1e" stroke="#132840" strokeWidth="1" opacity="0.93" />
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="60" y="644" letterSpacing="1">SIGNAL</text>
                <rect x="60" y="710" width="14" height="20" rx="2" fill="url(#sf2)" opacity="0.9"><animate attributeName="opacity" values="0.9;0.6;0.9" dur="1.8s" repeatCount="indefinite" /></rect>
                <rect x="80" y="698" width="14" height="32" rx="2" fill="url(#sf2)" opacity="0.9"><animate attributeName="opacity" values="0.9;0.7;0.9" dur="2.1s" repeatCount="indefinite" /></rect>
                <rect x="100" y="682" width="14" height="48" rx="2" fill="url(#sf2)" opacity="0.9"><animate attributeName="opacity" values="0.9;0.8;0.9" dur="1.5s" repeatCount="indefinite" /></rect>
                <rect x="120" y="668" width="14" height="62" rx="2" fill="url(#sf2)" opacity="0.9"><animate attributeName="opacity" values="0.9;0.75;0.9" dur="2.4s" repeatCount="indefinite" /></rect>
                <rect x="140" y="660" width="14" height="70" rx="2" fill="#1a3550" stroke="#1a3a60" strokeWidth="0.5" />
                <text fontFamily="monospace" fontSize="14" fill="#29d4ff" x="185" y="700" textAnchor="end" className="df2">-61</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="185" y="715" textAnchor="end">dBm</text>
                <text fontFamily="monospace" fontSize="10" fill="#3be08a" x="140" y="740" textAnchor="middle">STRONG</text>
                {/* BOTTOM RIGHT: TELEMETRY */}
                <rect x="440" y="620" width="200" height="130" rx="10" fill="#070f1e" stroke="#132840" strokeWidth="1" opacity="0.93" />
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="460" y="644" letterSpacing="1">TELEMETRY</text>
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="460" y="668">PITCH</text>
                <text fontFamily="monospace" fontSize="11" fill="#29d4ff" x="620" y="668" textAnchor="end" className="df2">-2.4°</text>
                <line x1="460" y1="673" x2="620" y2="673" stroke="#132840" strokeWidth="0.5" />
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="460" y="692">ROLL</text>
                <text fontFamily="monospace" fontSize="11" fill="#29d4ff" x="620" y="692" textAnchor="end" className="df2">+1.1°</text>
                <line x1="460" y1="697" x2="620" y2="697" stroke="#132840" strokeWidth="0.5" />
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="460" y="716">V.SPEED</text>
                <text fontFamily="monospace" fontSize="11" fill="#3be08a" x="620" y="716" textAnchor="end">0.0 m/s</text>
                <line x1="460" y1="721" x2="620" y2="721" stroke="#132840" strokeWidth="0.5" />
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="460" y="740">TEMP</text>
                <text fontFamily="monospace" fontSize="11" fill="#f5c842" x="620" y="740" textAnchor="end" className="df2">38°C</text>
                {/* BOTTOM CENTER: FLIGHT PATH */}
                <rect x="240" y="610" width="200" height="150" rx="10" fill="#040c18" stroke="#132840" strokeWidth="1" opacity="0.96" />
                <text fontFamily="monospace" fontSize="10" fill="#6a9dc8" x="340" y="632" textAnchor="middle" letterSpacing="1">FLIGHT PATH</text>
                <g stroke="#0e2035" strokeWidth="0.5" clipPath="url(#sc2)">
                  <line x1="240" y1="650" x2="440" y2="650" /><line x1="240" y1="680" x2="440" y2="680" />
                  <line x1="240" y1="710" x2="440" y2="710" /><line x1="240" y1="740" x2="440" y2="740" />
                  <line x1="270" y1="612" x2="270" y2="760" /><line x1="310" y1="612" x2="310" y2="760" />
                  <line x1="340" y1="612" x2="340" y2="760" /><line x1="370" y1="612" x2="370" y2="760" />
                  <line x1="410" y1="612" x2="410" y2="760" />
                </g>
                <polyline className="pd2" points="268,748 285,730 295,720 305,710 315,698 325,688 332,678 340,695" fill="none" stroke="#1a5299" strokeWidth="2" opacity="0.8" />
                <circle cx="268" cy="748" r="5" fill="none" stroke="#3be08a" strokeWidth="1.5" />
                <circle cx="268" cy="748" r="2" fill="#3be08a" />
                <text fontFamily="monospace" fontSize="8" fill="#3be08a" x="276" y="752">HOME</text>
                <circle className="pp2" cx="340" cy="695" r="6" fill="none" stroke="#29d4ff" strokeWidth="1" opacity="0.8" />
                <polygon points="340,689 335,700 340,697 345,700" fill="#29d4ff" />
                <circle cx="340" cy="695" r="3" fill="#29d4ff" />
                <text fontFamily="monospace" fontSize="8" fill="#29d4ff" x="350" y="694">YOU</text>
                {/* BOTTOM STRIP */}
                <rect x="40" y="780" width="600" height="44" rx="10" fill="#0a1e38" stroke="#1a3a60" strokeWidth="1" opacity="0.9" />
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="68" y="806">FLIGHT TIME</text>
                <text fontFamily="monospace" fontSize="16" fill="#29d4ff" x="160" y="808">00:14:37</text>
                <text fontFamily="monospace" fontSize="11" fill="#4a7aaa" x="340" y="806" textAnchor="middle">DIST TRAVELED</text>
                <text fontFamily="monospace" fontSize="14" fill="#29d4ff" x="430" y="808">1.24 km</text>
                <circle cx="554" cy="797" r="4" fill="#ff3b3b"><animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite" /></circle>
                <text fontFamily="monospace" fontSize="11" fill="#ff6b6b" x="562" y="802">REC</text>
                <text fontFamily="monospace" fontSize="9" fill="#4a7aaa" x="562" y="815">4K · 60fps</text>
              </svg>
            </div>
            <div className="about-content">
              <div className="section-chip chip-sky">About HoverMethod</div>
              <h2 className="sec-title">More Than Flying.<br /><em>Real Understanding</em><br />of Drone Technology.</h2>
              <p className="sec-sub" style={{ margin: '14px 0 24px' }}>HoverMethod is designed for students who want to understand the science, systems, and practical possibilities behind drones — in a structured, engaging, and beginner-friendly format.</p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 24 }}>This is not passive screen learning. It is a guided foundation programme that builds early familiarity with drone concepts, how flight actually works, major hardware components, sensors, navigation, safety, and operational awareness.</p>
              <div className="pillar-cards">
                <div className="pillar"><div className="pillar-ic" style={{ background: '#EFF6FF' }}>🔬</div><div><h3>Learn the Science</h3><p>Understand the principles that make drones work — flight, control, and navigation explained from first principles.</p></div></div>
                <div className="pillar"><div className="pillar-ic" style={{ background: '#F0FDF4' }}>⚙️</div><div><h3>Understand the Systems</h3><p>Motors, ESCs, propellers, batteries, flight controllers, GPS, and sensors — how they work and how they work together.</p></div></div>
                <div className="pillar"><div className="pillar-ic" style={{ background: '#FFF7ED' }}>🚀</div><div><h3>Go Beyond Theory — Optionally</h3><p>Students may add hands-on practical sessions in their city or at Senrysa's Drone Center of Excellence at IIT Research Park.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENROLMENT */}
      <section style={{ background: '#051225' }} id="enroll">
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="section-chip chip-animate chip-sky">Summer Enrolment 2026</div>
            <h2 className="sec-title" style={{ color: 'white' }}>Choose Your<br /><em>Summer Experience.</em></h2>
            <p className="sec-sub" style={{ margin: '0 auto', maxWidth: 600, color: 'rgba(255,255,255,.7)' }}>Every student gets the live online foundation. Supercharge it with real-world drone flying — in your city or at Senrysa CoE, IIT Kharagpur Research Park (Kolkata).</p>
          </div>
          <div className="batch-strip">
            <span className="label">May Batches</span>
            <div className="batch-dates">
              {['18 May', '19 May', '20 May', '21 May', '22 May', '25 May', '26 May'].map(d => <span key={d} className="date-pill">{d}</span>)}
            </div>
          </div>
          {/* Step 1 */}
          <div style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', marginBottom: 2 }}>Always Included</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>HoverMethod Junior — Online Foundation</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#fff' }}>7 Days × 2 Hrs Live Online</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>₹2,249</div>
              </div>
            </div>
            <div style={{ padding: '10px 24px 14px', display: 'flex', flexWrap: 'wrap', gap: 7, borderTop: '1px solid rgba(255,255,255,.15)' }}>
              {['Live instructor-led sessions', 'Flight simulator practice', 'Drone science & hardware', 'GPS & sensors', 'Mission planning basics', 'Completion certificate'].map(f => (
                <span key={f} style={{ fontSize: 12, color: '#fff', padding: '3px 12px', background: 'rgba(255,255,255,.15)', borderRadius: 14 }}>✓ {f}</span>
              ))}
            </div>
          </div>
          {/* Step 2 label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ height: 1, flex: 1, background: '#1b3255' }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>Step 2 — Choose One Add-On</div>
            <div style={{ height: 1, flex: 1, background: '#1b3255' }} />
          </div>
          {/* Addon cards */}
          <div id="addon-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'stretch', marginBottom: 12 }}>
            <div className={`bundle-card${bundle === 'a' ? ' bundle-a-sel' : ''}`} onClick={() => setBundle('a')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: '#C2410C', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '2px 8px', display: 'inline-block', marginBottom: 6 }}>Practical Add-On · Option A</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>Practical Camp — In Your City</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>3-hour hands-on session · Real drone hardware · Guided by instructor</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Additional</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#EA6C0A' }}>+₹1,249</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>₹{fmt(bA.sub)} + ₹{fmt(bA.g)} GST = ₹{fmt(bA.total)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10, paddingTop: 10, borderTop: '1px solid #FEE2E2' }}>
                {['How real drones are set up and prepared for flight', 'Physical walkthrough of drone components and their roles', 'Supervised hands-on orientation with real drone hardware', 'Practical explanation of key flight systems'].map(p => <div key={p} style={{ fontSize: 12, color: 'var(--slate)' }}>✓ {p}</div>)}
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#92400E', display: 'flex', gap: 6 }}>
                <span>🏫</span><span>If <strong>60+ students from the same school</strong> opt for this, the session is conducted <strong>at your school campus.</strong></span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>OR</div>
            </div>
            <div className={`bundle-card${bundle === 'b' ? ' bundle-b-sel' : ''}`} onClick={() => setBundle('b')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--iit)', background: 'var(--iit-l)', border: '1px solid rgba(19,63,86,.2)', borderRadius: 10, padding: '2px 8px', display: 'inline-block', marginBottom: 6 }}>Premium Experience · Option B</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>CoE Experience — IIT Research Park</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>4-hour premium session · Senrysa Drone CoE · IIT Kharagpur</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Separate fee</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--iit)' }}>₹3,249</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>₹{fmt(bB.sub)} + ₹{fmt(bB.g)} GST = ₹{fmt(bB.total)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10, paddingTop: 10, borderTop: '1px solid #E0F2FE' }}>
                {["Premium guided practice at Senrysa's Drone CoE at IIT Research Park", "Interaction with researchers and engineers working on UAV systems", "Hands-on training in a professional institutional lab environment", "Aspirational exposure to India's premier drone R&D ecosystem"].map(p => <div key={p} style={{ fontSize: 12, color: 'var(--slate)' }}>✓ {p}</div>)}
              </div>
              <div style={{ fontSize: 12, color: '#133f56', fontWeight: 500 }}>★ Pre-appointment required · Limited slots · Travel to Kharagpur is independent</div>
            </div>
          </div>
          {/* Total + Pay */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)', marginBottom: 6 }}>Your Total</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>₹</span>
                  <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: -1 }}>{fmt(cur.total)}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>HoverMethod Junior ₹2,249 + {curName} ₹{fmt(curAddon)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                <button
                  onClick={() => {
                    setPendingPayment({ amt: cur.total, desc: `HoverMethod Junior + ${curName}` });
                    setShowPayForm(true);
                  }}
                  disabled={paying}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff',
                    padding: '15px 28px', borderRadius: 50, fontSize: 16, fontWeight: 700,
                    border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
                    opacity: paying ? .7 : 1, boxShadow: '0 6px 24px rgba(22,163,74,.35)',
                  }}>
                  {paying ? 'Processing…' : 'Pay Now ›'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  Limited seats — batch fills fast
                </div>
              </div>
            </div>
          </div>
          {/* Online only */}
          <div style={{ marginTop: 12, padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Or enrol for online programme only — no add-on</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--slate)' }}>HoverMethod Junior — Online Only</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>7 Days × 2 Hours Live Online · Certificate included</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--slate)' }}>₹2,249 <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}>+ GST</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>₹2,249 + ₹{fmt(bOnline.g)} GST = ₹{fmt(bOnline.total)}</div>
              </div>
              <button onClick={() => {
                setPendingPayment({ amt: bOnline.total, desc: 'HoverMethod Junior — Online Foundation' });
                setShowPayForm(true);
              }} disabled={paying} style={{
                fontSize: 13, fontWeight: 600, color: 'var(--slate)',
                padding: '9px 20px', borderRadius: 24, border: '1.5px solid var(--border)',
                background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                Pay Now
              </button>            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" style={{ background: 'var(--off)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="section-chip chip-green">Full Curriculum</div>
            <h2 className="sec-title">8 Days of Learning.<br /><em>Zero to First Flight.</em></h2>
            <p className="sec-sub" style={{ margin: '0 auto', maxWidth: 560 }}>7 live online sessions covering complete theory — then one hands-on day where students build a real drone from scratch and fly it. Click any day to expand.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CURRICULUM.map(item => {
              const isOpen = openAcc === item.day;
              return (
                <div key={item.day} className={`acc-item${isOpen ? ' acc-open' : ''}`}>
                  <button type="button" className="acc-hdr" onClick={() => setOpenAcc(isOpen ? null : item.day)}>
                    <div className="acc-left">
                      <div className="acc-num" style={{ background: item.color }}>{item.day}</div>
                      <div><div className="acc-day-lbl">{item.label}</div><div className="acc-ttl">{item.title}</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: item.tagBg, color: item.tagColor, border: `1px solid ${item.tagBorder}` }}>{item.tag}</span>
                      <span className="acc-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>▼</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="acc-body" style={{ display: 'block' }}>
                      <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 14 }}>{item.desc}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
                        {item.points.map((pt, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a5270', flexShrink: 0, marginTop: 5, display: 'inline-block' }} />
                            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.65 }}>{pt}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: '#F0F9FF', border: '1px solid #E0F2FE', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0369A1', fontWeight: 500, lineHeight: 1.5 }}>🎯 {item.outcome}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="who-section" id="who">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-chip chip-orange">Who Should Join</div>
            <h2 className="sec-title">HoverMethod Is For<br /><em>Every Kind of Learner.</em></h2>
            <p className="sec-sub" style={{ margin: '0 auto' }}>No prior knowledge needed. No equipment to buy. Just curiosity and readiness to learn something genuinely new.</p>
          </div>
          <div className="who-grid" style={{ marginTop: 28 }}>
            {[
              { bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', icon: '🔭', badge: 'Curious Learners', badgeBg: 'var(--sky-l)', badgeColor: 'var(--sky-dd)', title: "Science & Gadget Lovers", desc: "Students who love science, robotics, or future technology — they'll finally understand how the drones they see every day actually work." },
              { bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', icon: '⚙️', badge: 'STEM Explorers', badgeBg: '#ECFDF5', badgeColor: '#065F46', title: 'Systems Thinkers', desc: 'Students who enjoy understanding how complex systems work and want exposure that goes well beyond what textbooks cover.' },
              { bg: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', icon: '🚀', badge: 'Future Builders', badgeBg: '#FFF7ED', badgeColor: '#C2410C', title: 'Aspiring Engineers', desc: 'Students interested in aerospace, robotics, engineering, or autonomous systems — this is an early and meaningful entry point.' },
              { bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', icon: '🎯', badge: 'Career Seekers', badgeBg: '#F5F3FF', badgeColor: '#5B21B6', title: 'Future Pathfinders', desc: 'Students who want early exposure to technology pathways — aviation, robotics, defence, data — that may shape their future study and career.' },
            ].map(w => (
              <div key={w.title} className="who-card">
                <div className="who-top" style={{ background: w.bg }}>{w.icon}</div>
                <div className="who-body">
                  <span className="who-badge" style={{ background: w.badgeBg, color: w.badgeColor }}>{w.badge}</span>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR SCHOOLS */}
      <section className="schools-section" id="schools">
        <div className="container">
          <div className="schools-grid">
            <div className="schools-copy">
              <div className="section-chip chip-dark">For Schools &amp; Institutions</div>
              <h2 className="sec-title" style={{ color: '#fff' }}>Partner With HoverMethod.<br /><em style={{ color: 'var(--primary)' }}>Bring Drones to Your Campus.</em></h2>
              <p className="sec-sub" style={{ color: 'rgba(255,255,255,.75)' }}>Whether you want to run a student batch programme, set up a drone workshop, establish a campus drone club, or build a full AI/Drone Lab — we partner with schools to make it happen.</p>
              <div className="school-benefits" style={{ marginTop: 28 }}>
                {[['🎓', 'Student Batch Programme', 'Run HoverMethod Junior for your Class 7-12 students as a school or club initiative'], ['🔧', 'Campus Drone Workshop', 'One-day or weekend hands-on workshop at your school, customised for your student group'], ['🤖', 'AI and Drone Lab Setup', 'Full turnkey lab: equipment, curriculum, faculty training, and ongoing support'], ['📋', 'NEP 2020 Aligned', "Experiential, STEM-focused content aligned with India's National Education Policy"], ['🏫', 'On-Campus Practical Camp', 'Schools with 60+ enrolled students get the practical camp at the school campus'], ['🏆', 'School Recognition', 'Position your school as a leader in STEM innovation and drone technology education']].map(([ic, t, d]) => (
                  <div key={t as string} className="sb-item"><span className="sb-icon">{ic}</span><div><strong>{t}</strong> — {d}</div></div>
                ))}
              </div>
            </div>
            <div className="schools-cta-box">
              <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,.12)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>School Enquiry Form</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Tell us about your school. We respond within 24 hours.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>School Name</label><input ref={sfSchool} type="text" placeholder="e.g. DPS Newtown" style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>Your Name</label><input ref={sfName} type="text" placeholder="Contact person" style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>Phone / WhatsApp</label><input ref={sfPhone} type="tel" placeholder="+91 XXXXX XXXXX" style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>Approx. Students</label>
                      <select ref={sfStudents} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                        <option value="">Select range</option>
                        {['Under 30', '30 to 60', '60 to 100', '100 to 200', '200 plus'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 6 }}>Interested in</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {['Student Programme', 'Campus Workshop', 'Drone Lab Setup', 'AI Lab Setup', 'Tie-Up Partnership'].map(val => (
                        <label key={val} style={{ cursor: 'pointer' }}>
                          <input type="checkbox" style={{ display: 'none' }} checked={sfInterests.includes(val)} onChange={() => setSfInterests(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])} />
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, border: sfInterests.includes(val) ? '1.5px solid var(--sky)' : '1.5px solid var(--border)', color: sfInterests.includes(val) ? 'var(--sky-dd)' : 'var(--muted)', background: sfInterests.includes(val) ? 'var(--sky-xl)' : '#fff' }}>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>Specific requirement?</label><textarea ref={sfMsg} rows={2} placeholder="e.g. Workshop for Class 9-10 STEM club, 40 students, in May..." style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>
                  <button onClick={submitSchool} style={{ background: 'var(--wa)', color: '#fff', border: 'none', borderRadius: 50, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Send Enquiry via WhatsApp</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY HOVERMETHOD */}
      <section className="why-section" id="why">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-chip chip-sky">Why HoverMethod</div>
            <h2 className="sec-title">Built With Intention.<br /><em>Not Just Content.</em></h2>
          </div>
          <div className="why-grid">
            {[
              { ic: '🧭', title: 'Structured, Not Random', desc: 'Every session builds on the last. The curriculum is designed as a logical progression — not disconnected topics thrown together into a syllabus.', pill: 'Clear Learning Path', pillBg: 'var(--sky-l)', pillColor: 'var(--sky-dd)' },
              { ic: '🎯', title: 'Live, Not Passive', desc: 'Instructor-led sessions that keep students engaged. Students can ask questions, get answers, and participate actively — not watch a video and forget it by lunch.', pill: 'Real-Time Interaction', pillBg: '#FFF7ED', pillColor: '#C2410C' },
              { ic: '🔬', title: 'Real Technology, Explained Simply', desc: 'Serious drone science taught the way school students can genuinely understand. No oversimplification. No unnecessary jargon. Just clear teaching.', pill: 'Appropriate Depth', pillBg: '#ECFDF5', pillColor: '#065F46' },
              { ic: '🛠️', title: 'Practical Add-Ons Available', desc: 'Students are not forced to pay for hands-on sessions they may not need. Both the Practical Camp and CoE Experience are genuinely optional choices.', pill: 'Choose Your Level', pillBg: '#FFF7ED', pillColor: '#C2410C' },
              { ic: '🏫', title: 'School-Friendly Activation', desc: 'Schools can introduce the programme to their students with minimal friction. The campus practical camp option makes it even easier to deliver value on school premises.', pill: '60+ Student Campus Option', pillBg: 'var(--sky-l)', pillColor: 'var(--sky-dd)' },
              { ic: '🏛️', title: 'Premium CoE Exposure', desc: "For students who want the deepest experience, the CoE path provides access to Senrysa's Drone Center of Excellence at IIT Research Park — an aspirational upgrade.", pill: 'IIT Research Park', pillBg: 'var(--iit-l)', pillColor: 'var(--iit)' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <div className="why-ic">{w.ic}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
                <span className="why-pill" style={{ background: w.pillBg, color: w.pillColor }}>{w.pill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="outcomes-section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-chip chip-green">What Students Take Back</div>
            <h2 className="sec-title">Skills and Awareness<br /><em>That Stay.</em></h2>
          </div>
          <div className="outcomes-grid" style={{ marginTop: 22 }}>
            {[
              { ic: '🧠', bg: '#EFF6FF', title: 'Foundation Understanding', desc: 'A solid foundation-level grasp of drone technology — not surface-level trivia but real conceptual understanding.' },
              { ic: '⚙️', bg: '#F0FDF4', title: 'Systems Awareness', desc: 'Early familiarity with key drone systems and components — the kind of knowledge that compounds with further study.' },
              { ic: '🌐', bg: '#FFF7ED', title: 'Technology Awareness', desc: 'Better awareness of how drone technology is already shaping agriculture, logistics, mapping, and defence in India.' },
              { ic: '🎮', bg: '#EFF6FF', title: 'Simulator Experience', desc: 'Practical conceptual flying practice through simulator-based sessions — a feel for real drone controls without the risk.' },
              { ic: '📜', bg: '#ECFDF5', title: 'Completion Certificate', desc: 'A certificate of participation and completion — meaningful for school portfolios, STEM club records, and college applications.' },
              { ic: '🚀', bg: '#F5F3FF', title: 'Confidence to Explore', desc: 'Stronger confidence to pursue related STEM pathways — aerospace, robotics, engineering, data science, or autonomous systems.' },
            ].map(o => (
              <div key={o.title} className="oc-item">
                <div className="oc-ic" style={{ background: o.bg }}>{o.ic}</div>
                <div><h4>{o.title}</h4><p>{o.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COE SECTION */}
      <section className="coe-section" id="coe">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="section-chip chip-iit">Premium Add-On · Optional</div>
            <h2 className="sec-title" style={{ color: '#fff' }}>Senrysa Drone Center of Excellence<br /><em style={{ color: '#fde8da' }}>at IIT Research Park, Kolkata.</em></h2>
            <p className="sec-sub" style={{ color: 'rgba(255,255,255,.7)', margin: '0 auto', maxWidth: 540 }}>An optional 4-hour premium experience at one of India's most advanced drone research facilities — built by Senrysa Technologies in partnership with IIT Kharagpur.</p>
          </div>
          <div className="premium-addon">
            <div>
              <div className="coe-items">
                {[['🚁', 'See professional research-grade drone systems used in real industrial and defence missions'], ['🔬', 'Walk through a specialised UAV design, fabrication, and testing lab at IIT Research Park'], ['🎓', 'Interact with researchers and engineers working on drone autonomy and AI systems'], ['🤖', 'Exposure to AI/ML in drone navigation, computer vision, and autonomous flight'], ['✈️', 'Supervised hands-on session with professional-grade hardware in a real R&D environment']].map(([ic, t]) => (
                  <div key={t as string} className="coe-item"><div className="ci2">{ic}</div><div>{t}</div></div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, padding: '20px 22px', marginTop: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>📍 Venue Address</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Senrysa Drone Center of Excellence</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,.82)', lineHeight: 1.8 }}>IIT Kharagpur Research Park<br />Plot No. IIIB-12, Category Bulk Land<br />Action Area-III, New Town<br /><strong style={{ color: '#fde8da' }}>Kolkata – 700 160</strong></div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['4 Hours', 'Pre-appointment required'].map(t => <span key={t} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{t}</span>)}
                  <span style={{ background: 'rgba(19,63,86,.2)', border: '1px solid rgba(19,63,86,.3)', borderRadius: 14, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#fde8da' }}>Limited slots</span>
                </div>
              </div>
            </div>
            <div>
              <svg width="100%" viewBox="0 0 680 650" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 12, marginBottom: 16 }}>
                <defs>
                  <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1628" /><stop offset="100%" stopColor="#0e2240" /></linearGradient>
                  <linearGradient id="bldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a3a6e" /><stop offset="100%" stopColor="#0f2448" /></linearGradient>
                  <linearGradient id="coeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e4d9a" /><stop offset="100%" stopColor="#122e68" /></linearGradient>
                  <linearGradient id="glG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a6acc" stopOpacity="0.7" /><stop offset="100%" stopColor="#1a3f8f" stopOpacity="0.5" /></linearGradient>
                  <linearGradient id="rdG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0a1628" /><stop offset="50%" stopColor="#152040" /><stop offset="100%" stopColor="#0a1628" /></linearGradient>
                  <style>{`
                    @keyframes dF2{0%,100%{transform:translateY(0px) translateX(0px)}25%{transform:translateY(-8px) translateX(4px)}75%{transform:translateY(4px) translateX(-3px)}}
                    @keyframes pS2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                    @keyframes pSR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
                    @keyframes wG{0%,100%{opacity:.55}50%{opacity:.9}}
                    @keyframes sR{0%{r:0;opacity:.7}100%{r:28;opacity:0}}
                    @keyframes cM{0%{transform:translateX(-60px);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(700px);opacity:0}}
                    @keyframes cMR{0%{transform:translateX(700px);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(-60px);opacity:0}}
                    @keyframes tW{0%,100%{transform:rotate(0deg)}33%{transform:rotate(1.5deg)}66%{transform:rotate(-1deg)}}
                    .db3{animation:dF2 3.5s ease-in-out infinite;transform-origin:340px 130px}
                    .pt3{animation:pS2 .12s linear infinite;transform-origin:294px 110px}
                    .ptr3{animation:pSR .10s linear infinite;transform-origin:386px 110px}
                    .pb3{animation:pSR .11s linear infinite;transform-origin:294px 152px}
                    .pbr3{animation:pS2 .13s linear infinite;transform-origin:386px 152px}
                    .wg3{animation:wG 3s ease-in-out infinite}
                    .sg1{animation:sR 1.8s ease-out infinite;transform-origin:340px 130px}
                    .sg2{animation:sR 1.8s ease-out infinite .6s;transform-origin:340px 130px}
                    .cr1{animation:cM 7s linear infinite .5s}
                    .cr2{animation:cMR 9s linear infinite 3s}
                    .tr1{animation:tW 4s ease-in-out infinite;transform-origin:85px 460px}
                    .tr2{animation:tW 5s ease-in-out infinite 1s;transform-origin:600px 460px}
                  `}</style>
                </defs>
                <rect width="680" height="650" fill="url(#skyG)" rx="12" />
                <circle cx="610" cy="52" r="22" fill="#1e3a6e" /><circle cx="622" cy="46" r="18" fill="#0a1628" />
                <circle cx="80" cy="40" r="1.2" fill="#a8c8f0" opacity="0.7" /><circle cx="180" cy="25" r="1" fill="#c0d8f8" opacity="0.6" /><circle cx="420" cy="30" r="1" fill="#c0d8f8" opacity="0.7" /><circle cx="560" cy="45" r="1.2" fill="#a8c8f0" opacity="0.6" />
                <rect x="0" y="548" width="680" height="34" fill="url(#rdG)" opacity="0.9" />
                <line x1="0" y1="565" x2="680" y2="565" stroke="#1e3a6e" strokeWidth="1" strokeDasharray="18 14" />
                <g className="cr1"><rect x="40" y="553" width="38" height="18" rx="4" fill="#1a4a8a" opacity="0.9" /><rect x="76" y="558" width="5" height="5" rx="1" fill="#f5c842" opacity="0.9" /></g>
                <g className="cr2"><rect x="580" y="562" width="36" height="16" rx="4" fill="#2a4a1a" opacity="0.9" /><rect x="578" y="565" width="4" height="4" rx="1" fill="#ff6060" opacity="0.8" /></g>
                <rect x="160" y="583" width="360" height="30" fill="#0f2040" opacity="0.8" />
                <g className="tr1"><rect x="82" y="455" width="6" height="80" rx="2" fill="#1a3a1a" /><ellipse cx="85" cy="445" rx="22" ry="28" fill="#1a4a1a" /><ellipse cx="85" cy="435" rx="16" ry="20" fill="#1f5a1f" /></g>
                <g className="tr2"><rect x="597" y="455" width="6" height="80" rx="2" fill="#1a3a1a" /><ellipse cx="600" cy="445" rx="22" ry="28" fill="#1a4a1a" /><ellipse cx="600" cy="435" rx="16" ry="20" fill="#1f5a1f" /></g>
                <rect x="168" y="380" width="120" height="200" fill="url(#bldG)" rx="3" />
                <g fill="url(#glG)" className="wg3">
                  <rect x="180" y="395" width="18" height="12" rx="2" /><rect x="205" y="395" width="18" height="12" rx="2" /><rect x="230" y="395" width="18" height="12" rx="2" /><rect x="255" y="395" width="18" height="12" rx="2" />
                  <rect x="180" y="420" width="18" height="12" rx="2" /><rect x="205" y="420" width="18" height="12" rx="2" /><rect x="230" y="420" width="18" height="12" rx="2" /><rect x="255" y="420" width="18" height="12" rx="2" />
                  <rect x="180" y="445" width="18" height="12" rx="2" /><rect x="205" y="445" width="18" height="12" rx="2" /><rect x="230" y="445" width="18" height="12" rx="2" /><rect x="255" y="445" width="18" height="12" rx="2" />
                  <rect x="180" y="470" width="18" height="12" rx="2" /><rect x="205" y="470" width="18" height="12" rx="2" /><rect x="230" y="470" width="18" height="12" rx="2" /><rect x="255" y="470" width="18" height="12" rx="2" />
                </g>
                <rect x="392" y="380" width="120" height="200" fill="url(#bldG)" rx="3" />
                <g fill="url(#glG)" className="wg3">
                  <rect x="404" y="395" width="18" height="12" rx="2" /><rect x="429" y="395" width="18" height="12" rx="2" /><rect x="454" y="395" width="18" height="12" rx="2" /><rect x="479" y="395" width="18" height="12" rx="2" />
                  <rect x="404" y="420" width="18" height="12" rx="2" /><rect x="429" y="420" width="18" height="12" rx="2" /><rect x="454" y="420" width="18" height="12" rx="2" /><rect x="479" y="420" width="18" height="12" rx="2" />
                  <rect x="404" y="445" width="18" height="12" rx="2" /><rect x="429" y="445" width="18" height="12" rx="2" /><rect x="454" y="445" width="18" height="12" rx="2" /><rect x="479" y="445" width="18" height="12" rx="2" />
                  <rect x="404" y="470" width="18" height="12" rx="2" /><rect x="429" y="470" width="18" height="12" rx="2" /><rect x="454" y="470" width="18" height="12" rx="2" /><rect x="479" y="470" width="18" height="12" rx="2" />
                </g>
                <rect x="256" y="310" width="168" height="270" fill="url(#coeG)" rx="4" />
                <g fill="url(#glG)" className="wg3">
                  <rect x="268" y="325" width="30" height="28" rx="2" /><rect x="305" y="325" width="30" height="28" rx="2" /><rect x="342" y="325" width="30" height="28" rx="2" /><rect x="379" y="325" width="30" height="28" rx="2" />
                  <rect x="268" y="368" width="30" height="28" rx="2" /><rect x="305" y="368" width="30" height="28" rx="2" /><rect x="342" y="368" width="30" height="28" rx="2" /><rect x="379" y="368" width="30" height="28" rx="2" />
                  <rect x="268" y="418" width="30" height="28" rx="2" /><rect x="305" y="418" width="30" height="28" rx="2" /><rect x="342" y="418" width="30" height="28" rx="2" /><rect x="379" y="418" width="30" height="28" rx="2" />
                  <rect x="268" y="468" width="30" height="28" rx="2" /><rect x="305" y="468" width="30" height="28" rx="2" /><rect x="342" y="468" width="30" height="28" rx="2" /><rect x="379" y="468" width="30" height="28" rx="2" />
                </g>
                <rect x="250" y="302" width="180" height="12" rx="3" fill="#1e4888" />
                <rect x="272" y="520" width="136" height="28" rx="4" fill="#0a1e48" opacity="0.9" />
                <text fontFamily="monospace" fontSize="11" fill="#5aa0e8" x="340" y="538" textAnchor="middle" letterSpacing="2">SENRYSA CoE</text>
                <rect x="298" y="560" width="84" height="20" rx="2" fill="#0f1e3a" />
                <line x1="530" y1="580" x2="530" y2="290" stroke="#2a4a7a" strokeWidth="2" />
                <polygon points="530,290 530,310 556,300" fill="#e04040" opacity="0.9"><animateTransform attributeName="transform" type="skewX" values="0;4;0;-3;0" keyTimes="0;0.25;0.5;0.75;1" dur="3s" repeatCount="indefinite" /></polygon>
                <g className="db3">
                  <circle className="sg1" cx="340" cy="130" r="0" fill="none" stroke="#29d4ff" strokeWidth="1.5" opacity="0.7" />
                  <circle className="sg2" cx="340" cy="130" r="0" fill="none" stroke="#29d4ff" strokeWidth="1" opacity="0.5" />
                  <line x1="317" y1="125" x2="296" y2="112" stroke="#1a3a6e" strokeWidth="5" strokeLinecap="round" />
                  <line x1="363" y1="125" x2="384" y2="112" stroke="#1a3a6e" strokeWidth="5" strokeLinecap="round" />
                  <line x1="317" y1="137" x2="296" y2="150" stroke="#1a3a6e" strokeWidth="5" strokeLinecap="round" />
                  <line x1="363" y1="137" x2="384" y2="150" stroke="#1a3a6e" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="294" cy="110" r="10" fill="#0e2248" stroke="#2a5aaa" strokeWidth="1.5" />
                  <circle cx="386" cy="110" r="10" fill="#0e2248" stroke="#2a5aaa" strokeWidth="1.5" />
                  <circle cx="294" cy="152" r="10" fill="#0e2248" stroke="#2a5aaa" strokeWidth="1.5" />
                  <circle cx="386" cy="152" r="10" fill="#0e2248" stroke="#2a5aaa" strokeWidth="1.5" />
                  <g className="pt3"><ellipse cx="294" cy="110" rx="26" ry="4" fill="#2a5aaa" opacity="0.55" /><ellipse cx="294" cy="110" rx="26" ry="4" fill="#2a5aaa" opacity="0.45" transform="rotate(90 294 110)" /></g>
                  <g className="ptr3"><ellipse cx="386" cy="110" rx="26" ry="4" fill="#2a5aaa" opacity="0.55" /><ellipse cx="386" cy="110" rx="26" ry="4" fill="#2a5aaa" opacity="0.45" transform="rotate(90 386 110)" /></g>
                  <g className="pb3"><ellipse cx="294" cy="152" rx="26" ry="4" fill="#2a5aaa" opacity="0.55" /><ellipse cx="294" cy="152" rx="26" ry="4" fill="#2a5aaa" opacity="0.45" transform="rotate(90 294 152)" /></g>
                  <g className="pbr3"><ellipse cx="386" cy="152" rx="26" ry="4" fill="#2a5aaa" opacity="0.55" /><ellipse cx="386" cy="152" rx="26" ry="4" fill="#2a5aaa" opacity="0.45" transform="rotate(90 386 152)" /></g>
                  <rect x="316" y="112" width="48" height="38" rx="10" fill="#0e2248" stroke="#2a5aaa" strokeWidth="1.5" />
                  <circle cx="340" cy="131" r="10" fill="#081428" stroke="#1a3a6e" strokeWidth="1" />
                  <circle cx="340" cy="131" r="6" fill="#0a1e3a" stroke="#2a5aaa" strokeWidth="0.8" />
                  <circle cx="340" cy="131" r="3" fill="#051020" />
                  <circle cx="338" cy="129" r="1.2" fill="#29d4ff" opacity="0.7" />
                  <circle cx="322" cy="118" r="2.5" fill="#29d4ff"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.4s" repeatCount="indefinite" /></circle>
                  <circle cx="358" cy="118" r="2.5" fill="#29d4ff"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.4s" begin="0.7s" repeatCount="indefinite" /></circle>
                  <circle cx="322" cy="144" r="2.5" fill="#3be08a"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" repeatCount="indefinite" /></circle>
                  <circle cx="358" cy="144" r="2.5" fill="#3be08a"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" begin="1.1s" repeatCount="indefinite" /></circle>
                </g>
                <rect x="85" y="600" width="510" height="26" rx="6" fill="#060e1e" opacity="0.9" />
                <text fontFamily="monospace" fontSize="11" fill="#3a6aaa" x="340" y="617" textAnchor="middle">IIT Kharagpur Research Park · Action Area-III, New Town, Kolkata – 700 160</text>
              </svg>
              <div className="coe-cta-box">
                <h3>Book CoE Experience</h3>
                <p>4-hour premium session at Senrysa Drone CoE, IIT Research Park · Pre-appointment required · Limited slots</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4, justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>₹</span>
                  <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: -2 }}>3,249</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>&nbsp;+ GST</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 22 }}>per student · 4 hours · separate booking</div>
                <button onClick={() => {
                  setPendingPayment({ amt: calcGst(3249).total, desc: 'CoE Experience — IIT Research Park' });
                  setShowPayForm(true);
                }} disabled={paying} className="coe-book-btn" style={{ border: 'none' }}>
                  <svg style={{ width: 18, height: 18, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Book CoE Experience via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-chip chip-sky">FAQ</div>
            <h2 className="sec-title">Common <em>Questions</em> Answered.</h2>
          </div>
          <div className="faq-grid">
            {[FAQS.slice(0, 5), FAQS.slice(5)].map((col, ci) => (
              <div key={ci}>
                {col.map((f, i) => {
                  const idx = ci * 5 + i;
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className={`faq-item${isOpen ? ' open' : ''}`} style={{ marginTop: i > 0 ? 8 : 0 }}>
                      <div className="faq-q" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                        {f.q}<span className="faq-arr">▼</span>
                      </div>
                      <div className="faq-a">{f.a}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Start with the Foundation.<br /><span>Add Practical Learning</span> If You Want More.</h2>
          <p>Give students an early and meaningful introduction to drone technology through structured live learning — with optional practical and premium experiences available when they are ready.</p>
          <div className="final-btns">
            <button className="fb-wa" onClick={() => {
              setPendingPayment({ amt: bOnline.total, desc: 'HoverMethod Junior — Online Foundation' });
              setShowPayForm(true);
            }} disabled={paying} style={{ border: 'none', cursor: 'pointer' }}>
              {paying ? 'Processing…' : 'Pay Now ›'}
            </button>
            <button className="fb-sky" onClick={() => { setBundle('a'); document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ border: 'none', cursor: 'pointer' }}>
              + Add Practical Camp
            </button>
            <a href="#coe" className="fb-ghost">Book CoE Experience →</a>
          </div>
        </div>
      </section>

      {showPayForm && pendingPayment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 28,
            width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
              Complete Enrolment
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Enter your details to proceed to payment
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--muted)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 4
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Riya Sharma"
                  value={payName}
                  onChange={e => setPayName(e.target.value)}
                  style={{
                    width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
                    padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--muted)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 4
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. riya@gmail.com"
                  value={payEmail}
                  onChange={e => setPayEmail(e.target.value)}
                  style={{
                    width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
                    padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--muted)',
                  textTransform: 'uppercase', display: 'block', marginBottom: 4
                }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={payPhone}
                  onChange={e => setPayPhone(e.target.value)}
                  style={{
                    width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
                    padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => { setShowPayForm(false); setPendingPayment(null); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid var(--border)',
                    background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    color: 'var(--muted)'
                  }}>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!payName.trim() || !payEmail.trim() || !payPhone.trim()) {
                      alert('Please fill in all fields');
                      return;
                    }
                    setShowPayForm(false);
                    pay(pendingPayment.amt, pendingPayment.desc, payName, payEmail, payPhone);
                  }}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 50, border: 'none',
                    background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer'
                  }}>
                  Proceed to Pay ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-inner max-w">
          <div className="footer-top">
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ opacity: 0.5, height: 36, width: 'auto' }} src="https://ik.imagekit.io/unizap/drone/logo_white.webp?tr=w-150" alt="HoverMethod" />
              <p>Future-ready drone learning for young minds. Class 7–12. Live online + optional practical add-ons.</p>
            </div>
            <div className="footer-links">
              <div className="fl-col">
                <h4>Programme</h4>
                <a href="#about">About HoverMethod</a>
                <a href="#curriculum">Curriculum</a>
                <a href="#enroll">Pricing &amp; Add-Ons</a>
              </div>
              <div className="fl-col">
                <h4>Add-Ons</h4>
                <a href="#enroll">Practical Camp</a>
                <a href="#coe">CoE Experience</a>
                <a href="#schools">For Schools</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="fl-col">
                <h4>Enrol</h4>
                <a href={`${WA}?text=Hi%2C+I+want+to+enrol`} target="_blank" rel="noreferrer">WhatsApp Enrolment</a>
                <a href={`${WA}?text=Hi%2C+school+enquiry`} target="_blank" rel="noreferrer">School Enquiry</a>
                <a href={`${WA}?text=Hi%2C+CoE+booking`} target="_blank" rel="noreferrer">Book CoE Experience</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-note">The Practical Camp and CoE Experience are optional add-ons. The CoE Experience at IIT Research Park is managed by Senrysa Technologies and is subject to availability. Pre-appointment is mandatory. Travel is the student&apos;s own responsibility.</p>
            <p className="footer-copy">© 2025 HOVERMETHOD · ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </footer>

      <button className={`scroll-top${showScroll ? ' show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </>
  );
}