"use client";

/* eslint-disable react-hooks/immutability -- Three.js animation frames intentionally mutate scene objects and camera refs. */

import {
  ArrowRight,
  ArrowUpRight,
  Box,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Cloud,
  Coins,
  Construction,
  Cpu,
  Eye,
  Factory,
  HardHat,
  Heart,
  House,
  Layers3,
  Lightbulb,
  MapPin,
  Menu,
  Network,
  Package,
  Paintbrush,
  Palette,
  PlugZap,
  Search,
  Send,
  Server,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  SolarPanel,
  Star,
  Store,
  Truck,
  UserCog,
  UserRound,
  Users,
  Warehouse,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "lenis";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

const navItems = [
  ["Universe", "universe"],
  ["Shopping", "shopping"],
  ["Platform", "platform"],
  ["Products", "products"],
  ["Network", "network"],
  ["Future", "future"],
] as const;

const disconnected = [
  ["Hardware", "One store, one price, uncertain stock", Wrench],
  ["Electronics", "A separate technical search", PlugZap],
  ["Painter", "Quality is hard to verify", Paintbrush],
  ["Contractor", "Availability lives offline", HardHat],
  ["Delivery", "Transport multiplies cost", Truck],
] as const;

const connected = [
  ["Products", Box],
  ["Services", Wrench],
  ["Contractors", HardHat],
  ["Installation", Construction],
  ["Consultation", Users],
  ["Delivery", Truck],
  ["Bulk material", Warehouse],
] as const;

const businessModels = [
  ["B2C", "One coordinated home journey", "Products, specialists, installation and delivery in one checkout.", House],
  ["B2B", "A serious procurement desk", "Bulk requirements, competitive quotes and project fulfilment.", Building2],
  ["Marketplace", "A network that compounds", "Retailers, distributors, makers and experts on one operating layer.", Network],
] as const;

const workshopProducts = [
  ["Architectural hardware", "Locks · hinges · handles", Wrench],
  ["Plumbing systems", "Valves · pipes · fittings", Construction],
  ["Industrial tools", "Power · hand · safety", HardHat],
] as const;

const labProducts = [
  ["Power & wiring", "Cables · panels · protection", Zap],
  ["Lighting systems", "LED · drivers · controls", Lightbulb],
  ["Smart infrastructure", "CCTV · inverter · solar", CircuitBoard],
] as const;

const roleData = [
  ["Customer", "Discover, compare, book and track", ShoppingBag],
  ["Vendor", "Catalog, stock, orders and settlements", Store],
  ["Contractor", "Leads, schedules, routes and payments", HardHat],
  ["Distributor", "Territory, warehouses and bulk supply", Warehouse],
  ["Admin", "Approvals, commissions and control", ShieldCheck],
] as const;

const appData = [
  ["Customer app", "Shop + book", ShoppingBag],
  ["Vendor app", "Sell + operate", Store],
  ["Contractor app", "Accept + execute", HardHat],
  ["Distributor panel", "Supply + manage", Warehouse],
  ["Admin panel", "Govern + grow", UserCog],
] as const;

const revenues = [
  ["Product commission", "Marketplace transactions", "68%"],
  ["Service commission", "Professional bookings", "54%"],
  ["Vendor subscription", "Premium operating tools", "76%"],
  ["Featured promotion", "Sponsored regional reach", "42%"],
  ["Delivery charge", "Hyperlocal logistics", "61%"],
  ["Bulk order margin", "High-volume procurement", "83%"],
] as const;

const technologies = [
  ["Web", "React / Next.js", Layers3],
  ["Mobile", "Flutter", Smartphone],
  ["Backend", "Node.js", Server],
  ["Data", "PostgreSQL / MongoDB", CircuitBoard],
  ["Cloud", "AWS", Cloud],
  ["Payments", "Razorpay / Stripe", Coins],
] as const;

const shopCategories = ["All", "Electrical", "Electronic", "Hardware", "Paint", "PVC Pipe", "Sanitary"] as const;

const shopProducts = [
  { name: "Chrome Basin Mixer", category: "Sanitary", brand: "Sirohi Select", price: 1299, rating: 4.8, reviews: 32, badge: "Best seller", icon: Wrench, tone: "copper", description: "Corrosion-resistant mixer for modern bathroom installations." },
  { name: "Modular Switch Set", category: "Electrical", brand: "Anchor", price: 549, rating: 4.7, reviews: 84, badge: "Popular", icon: Lightbulb, tone: "teal", description: "Clean, reliable switching for homes, shops, and offices." },
  { name: "LED Panel 18W", category: "Electronic", brand: "Havells", price: 699, rating: 4.6, reviews: 47, badge: "Fast delivery", icon: Zap, tone: "blue", description: "Bright, efficient panel lighting with a slim profile." },
  { name: "PVC Elbow 3/4 inch", category: "PVC Pipe", brand: "Padmavati", price: 39, rating: 4.5, reviews: 118, badge: "Value pack", icon: Construction, tone: "sand", description: "Durable plumbing connector for everyday site work." },
  { name: "Interior Emulsion 10L", category: "Paint", brand: "Sirohi Color Lab", price: 2480, rating: 4.9, reviews: 26, badge: "Color match", icon: Palette, tone: "rose", description: "Low-odor interior paint with a smooth, washable finish." },
  { name: "Pata Bolt 4 inch", category: "Hardware", brand: "Yuvraj", price: 89, rating: 4.4, reviews: 66, badge: "Site essential", icon: Box, tone: "steel", description: "Heavy-duty fastening for doors, frames, and fabrication." },
  { name: "Copper Wire 90m", category: "Electrical", brand: "RR Kabel", price: 2890, rating: 4.8, reviews: 19, badge: "Verified", icon: PlugZap, tone: "gold", description: "Reliable insulated wire for residential and commercial runs." },
  { name: "Wall Primer 4L", category: "Paint", brand: "Sirohi Color Lab", price: 760, rating: 4.6, reviews: 41, badge: "Project ready", icon: Paintbrush, tone: "violet", description: "Strong base coat for cleaner, longer-lasting color." },
] as const;

type ShopProduct = (typeof shopProducts)[number];

const districts = [
  ["Interior design", "Plan, specify and execute", Palette],
  ["Home automation", "Connected comfort and security", Cpu],
  ["Solar installation", "Select, install and maintain", SolarPanel],
  ["Construction material", "Structure to finishing", Building2],
  ["Furniture", "Customize, deliver and assemble", House],
  ["Architecture", "Consultation connected to build", Construction],
] as const;

function Dust() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(450 * 3);
    for (let i = 0; i < values.length; i += 3) {
      const particle = i / 3 + 1;
      const x = ((particle * 16807) % 2147483647) / 2147483647;
      const y = ((particle * 48271) % 2147483647) / 2147483647;
      const z = ((particle * 69621) % 2147483647) / 2147483647;
      values[i] = (x - 0.5) * 30;
      values[i + 1] = (y - 0.5) * 19;
      values[i + 2] = (z - 0.5) * 24;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d59a6b" size={0.035} transparent opacity={0.48} sizeAttenuation />
    </points>
  );
}

function IBeam() {
  return (
    <group rotation={[0.15, -0.7, 0.18]}>
      <mesh scale={[4.2, 0.24, 0.82]}><boxGeometry /><meshPhysicalMaterial color="#68767a" metalness={0.92} roughness={0.24} clearcoat={0.7} /></mesh>
      <mesh scale={[4.2, 1.55, 0.18]}><boxGeometry /><meshPhysicalMaterial color="#3f4d51" metalness={0.9} roughness={0.3} /></mesh>
      <mesh scale={[4.2, 0.24, 0.82]} position={[0, 1.55, 0]}><boxGeometry /><meshPhysicalMaterial color="#768488" metalness={0.94} roughness={0.22} clearcoat={0.6} /></mesh>
    </group>
  );
}

function Gear() {
  return (
    <group rotation={[0.25, 0.15, 0]}>
      <mesh><torusGeometry args={[1.1, 0.33, 16, 48]} /><meshStandardMaterial color="#b46d43" metalness={0.88} roughness={0.28} /></mesh>
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return <mesh key={index} position={[Math.cos(angle) * 1.38, Math.sin(angle) * 1.38, 0]} rotation={[0, 0, angle]} scale={[0.34, 0.22, 0.45]}><boxGeometry /><meshStandardMaterial color="#885039" metalness={0.84} roughness={0.34} /></mesh>;
      })}
    </group>
  );
}

function PipeValve() {
  return (
    <group rotation={[0, 0.3, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[0.28, 0.28, 4.8, 28]} /><meshPhysicalMaterial color="#8d573b" metalness={0.9} roughness={0.24} /></mesh>
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.1, 12, 36]} /><meshStandardMaterial color="#c07a4c" metalness={0.86} roughness={0.3} /></mesh>
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 1.3, 12]} /><meshStandardMaterial color="#b56b43" metalness={0.9} /></mesh>
    </group>
  );
}

function CircuitPanel() {
  return (
    <group rotation={[-0.25, -0.5, 0.08]}>
      <RoundedBox args={[3.2, 2.05, 0.16]} radius={0.12} smoothness={4}><meshStandardMaterial color="#163f3d" metalness={0.45} roughness={0.42} /></RoundedBox>
      {[-1, -0.35, 0.4, 1].map((x, index) => <mesh key={x} position={[x, index % 2 ? 0.38 : -0.36, 0.15]} scale={[0.32, 0.28, 0.1]}><boxGeometry /><meshStandardMaterial color={index === 2 ? "#d49a53" : "#282f31"} metalness={0.7} /></mesh>)}
      <mesh position={[0, 0, 0.12]}><torusGeometry args={[0.78, 0.018, 8, 44]} /><meshBasicMaterial color="#65b7aa" /></mesh>
    </group>
  );
}

function SolarArray() {
  return (
    <group rotation={[-0.5, -0.35, -0.12]}>
      <mesh scale={[2.8, 1.55, 0.1]}><boxGeometry /><meshPhysicalMaterial color="#163a4c" metalness={0.68} roughness={0.18} clearcoat={1} /></mesh>
      {[-0.75, 0, 0.75].map((x) => <mesh key={x} position={[x, 0, 0.07]} scale={[0.018, 1.5, 0.02]}><boxGeometry /><meshBasicMaterial color="#7cb0b8" /></mesh>)}
      {[-0.5, 0, 0.5].map((y) => <mesh key={y} position={[0, y, 0.07]} scale={[2.7, 0.018, 0.02]}><boxGeometry /><meshBasicMaterial color="#7cb0b8" /></mesh>)}
    </group>
  );
}

function ConstructionWorld() {
  const root = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const { camera, pointer } = useThree();

  useFrame((state, delta) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / max;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.72 + Math.sin(progress * Math.PI * 5) * 0.35, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.42 + Math.cos(progress * Math.PI * 3) * 0.2, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10.5 - Math.sin(progress * Math.PI) * 1.3, 0.025);
    camera.lookAt(0, 0, -2);
    if (root.current) {
      root.current.rotation.y += delta * 0.018;
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
    if (spot.current) spot.current.position.x = Math.sin(state.clock.elapsedTime * 0.22) * 7;
  });

  return (
    <>
      <color attach="background" args={["#070a0b"]} />
      <fog attach="fog" args={["#070a0b", 8, 31]} />
      <ambientLight intensity={0.5} color="#9fb2af" />
      <hemisphereLight intensity={0.52} color="#9db5c0" groundColor="#1b1512" />
      <spotLight ref={spot} position={[5, 8, 6]} angle={0.34} penumbra={0.86} intensity={85} color="#df9d6e" castShadow />
      <pointLight position={[-7, 2, 1]} intensity={28} color="#3c8790" />
      <Dust />
      <group ref={root}>
        <Float speed={0.75} rotationIntensity={0.2} floatIntensity={0.4}><group position={[2.8, 0.6, -3.5]}><IBeam /></group></Float>
        <Float speed={0.9} rotationIntensity={0.55} floatIntensity={0.6}><group position={[-4.9, 2.3, -6]} scale={0.82}><Gear /></group></Float>
        <Float speed={0.65} rotationIntensity={0.26} floatIntensity={0.45}><group position={[5.4, -2.3, -7]} scale={0.65}><PipeValve /></group></Float>
        <Float speed={0.8} rotationIntensity={0.28} floatIntensity={0.5}><group position={[-4.5, -2.8, -9]} scale={0.73}><CircuitPanel /></group></Float>
        <Float speed={0.58} rotationIntensity={0.2} floatIntensity={0.35}><group position={[6.6, 3.6, -11]} scale={0.7}><SolarArray /></group></Float>
        <Float speed={0.82} rotationIntensity={0.35} floatIntensity={0.5}>
          <group position={[-6.5, -0.6, -12]}>
            <RoundedBox args={[1.6, 0.7, 1.1]} radius={0.08}><meshStandardMaterial color="#4d4a42" roughness={0.82} /></RoundedBox>
            <RoundedBox args={[1.45, 0.62, 1]} position={[0.7, 0.68, 0]} radius={0.06}><meshStandardMaterial color="#706758" roughness={0.88} /></RoundedBox>
          </group>
        </Float>
      </group>
      <mesh position={[0, -4.5, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial color="#0d1213" metalness={0.72} roughness={0.58} blur={[420, 90]} resolution={512} mixBlur={0.72} mixStrength={0.68} depthScale={0.8} />
      </mesh>
      <ContactShadows position={[0, -4.42, -2]} scale={24} opacity={0.5} blur={2.8} far={14} color="#000000" />
    </>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 34, filter: "blur(9px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function SceneHeading({ eyebrow, title, copy, center = false }: { eyebrow: string; title: ReactNode; copy: string; center?: boolean }) {
  return (
    <Reveal className={`scene-heading ${center ? "is-centered" : ""}`}>
      <span><i />{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </Reveal>
  );
}

function Portal({ label, copy, Icon, active, onClick }: { label: string; copy: string; Icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`role-portal ${active ? "is-active" : ""}`} onClick={onClick} aria-pressed={active}>
      <span className="portal-ring"><i /><Icon size={25} /></span>
      <strong>{label}</strong><small>{copy}</small>
    </button>
  );
}

export function SirohiMarketplace() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const [wallWidth, setWallWidth] = useState(18);
  const [wallHeight, setWallHeight] = useState(10);
  const [coats, setCoats] = useState(2);
  const [paintColor, setPaintColor] = useState("#b86743");
  const [sent, setSent] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [shopCategory, setShopCategory] = useState<(typeof shopCategories)[number]>("All");
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);
  const [shopNotice, setShopNotice] = useState("");
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, restDelta: 0.001 });
  const heroY = useTransform(smoothProgress, [0, 0.08], [0, 130]);
  const heroScale = useTransform(smoothProgress, [0, 0.08], [1, 1.12]);

  const paint = useMemo(() => {
    const area = wallWidth * wallHeight;
    const litres = Math.max(1, Math.ceil((area * coats) / 95));
    return { area, litres, cost: litres * 520 };
  }, [wallWidth, wallHeight, coats]);

  const visibleShopProducts = useMemo(() => {
    const query = shopSearch.trim().toLowerCase();
    return shopProducts.filter((product) => {
      const matchesCategory = shopCategory === "All" || product.category === shopCategory;
      const matchesQuery = !query || [product.name, product.category, product.brand].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [shopCategory, shopSearch]);

  const announceShopAction = (message: string) => {
    setShopNotice(message);
    window.setTimeout(() => setShopNotice(""), 2600);
  };

  const addToCart = (product: ShopProduct) => {
    setCartCount((count) => count + 1);
    announceShopAction(`${product.name} added to your project cart.`);
  };

  const toggleWishlist = (product: ShopProduct) => {
    setWishlist((items) => items.includes(product.name) ? items.filter((item) => item !== product.name) : [...items, product.name]);
    announceShopAction(wishlist.includes(product.name) ? `${product.name} removed from wishlist.` : `${product.name} saved to wishlist.`);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2500);
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    const pointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - 0.5) * 12}px`);
      document.documentElement.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - 0.5) * 12}px`);
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); lenis.destroy(); window.removeEventListener("pointermove", pointer); };
  }, []);

  return (
    <main className="digital-universe" id="universe">
      <AnimatePresence>
        {loading ? (
          <motion.div className="cinematic-loader" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="loader-warehouse"><i /><i /><i /></div>
            <motion.div className="loader-logo" initial={{ scale: 0.6, opacity: 0, rotateY: -32 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 7, opacity: 0, filter: "blur(16px)" }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}>
              <span className="logo-fragment fragment-a" /><span className="logo-fragment fragment-b" /><span className="logo-fragment fragment-c" /><span className="logo-fragment fragment-d" />
              <img src="/logo_sirohi.png" alt="Sirohi Point" />
              <b />
            </motion.div>
            <p>Assembling the complete solution</p><div className="loader-line"><i /></div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="world-stage" aria-hidden="true"><Canvas dpr={[1, 1.45]} camera={{ position: [0, 0, 10.5], fov: 48 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}><ConstructionWorld /></Canvas></div>
      <div className="atmosphere" aria-hidden="true"><i className="gradient-mesh" /><i className="moving-fog fog-a" /><i className="moving-fog fog-b" /><i className="industrial-grid" /><i className="steel-beam beam-a" /><i className="steel-beam beam-b" /><i className="light-shaft shaft-a" /><i className="light-shaft shaft-b" /><i className="glass-reflection" /><i className="depth-vignette" /><i className="noise-layer" /></div>
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} />

      <header className="command-nav">
        <a className="nav-brand" href="#universe" aria-label="Sirohi Point home"><span><img src="/logo_sirohi.png" alt="" /></span><b>SIROHI POINT<small>THE COMPLETE SOLUTION</small></b></a>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
          {navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="nav-commerce-actions" aria-label="Shopping shortcuts">
          <a className="nav-icon-action" href="#shopping" aria-label={`Wishlist, ${wishlist.length} saved`}><Heart size={17} /><span>{wishlist.length}</span></a>
          <a className="nav-icon-action" href="#shopping" aria-label={`Project cart, ${cartCount} items`}><ShoppingCart size={17} /><span>{cartCount}</span></a>
          <a className="nav-icon-action" href="#contact" aria-label="Account and project support"><UserRound size={17} /></a>
        </div>
        <a className="nav-action" href="#contact">Start a project <ArrowUpRight size={15} /></a>
        <button type="button" className="nav-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="world-scene hero-world">
        <motion.div className="hero-content" style={{ y: heroY }}>
          <motion.span className="signal-pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}><i /> India&apos;s connected construction universe</motion.span>
          <h1 aria-label="Build every space with one complete solution">
            <motion.span className="material-line material-steel" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 2.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>BUILD EVERY SPACE.</motion.span>
            <motion.span className="material-line material-copper" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 2.58, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>CONNECT EVERY NEED.</motion.span>
            <motion.span className="material-line material-glass" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 2.71, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>ONE COMPLETE SOLUTION.</motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.86, duration: 0.7 }}>Hardware, electronics, painting, contractors, installation, consultation, delivery and bulk procurement—engineered into one intelligent platform.</motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3, duration: 0.7 }}><a className="primary-cta" href="#platform">Enter the ecosystem <ArrowRight size={17} /></a><a className="ghost-cta" href="#products">Explore product worlds</a></motion.div>
          <div className="hero-metrics"><span><strong>03</strong> product universes</span><span><strong>05</strong> connected applications</span><span><strong>01</strong> project timeline</span></div>
        </motion.div>
        <motion.div className="hero-core" style={{ scale: heroScale }}>
          <div className="orbit orbit-one"><i /><i /><i /></div><div className="orbit orbit-two"><i /><i /></div>
          <img src="/sirohi-ecosystem-hero.png" alt="Hardware, electrical and painting products assembled in one connected industrial environment" />
          <span className="object-chip chip-hardware"><Wrench size={15} /> Hardware</span><span className="object-chip chip-electrical"><PlugZap size={15} /> Electronics</span><span className="object-chip chip-paint"><Palette size={15} /> Painting</span>
        </motion.div>
        <a className="scroll-cue" href="#fracture"><span>Travel through the system</span><ChevronDown size={17} /></a>
      </section>

      <section className="world-scene shopping-world" id="shopping">
        <div className="shopping-intro">
          <SceneHeading eyebrow="Commerce layer connected" title={<>Shop the system. <em>Build with confidence.</em></>} copy="The live shopping experience now sits inside the Sirohi universe: discover trusted brands, compare practical products, save favourites and build one project cart." />
          <div className="shopping-quick-links" aria-label="Shopping features"><span><Check size={14} /> Fast local fulfilment</span><span><Check size={14} /> Verified sellers</span><span><Check size={14} /> Project-ready pricing</span></div>
        </div>

        <div className="commerce-shell">
          <div className="commerce-toolbar">
            <form className="commerce-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("shopping-products")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              <Search size={18} aria-hidden="true" />
              <input value={shopSearch} onChange={(event) => setShopSearch(event.target.value)} placeholder="Search products, brands & more" aria-label="Search products, brands and categories" />
              <button type="submit">Go</button>
            </form>
            <div className="commerce-toolbar-actions">
              <button type="button" onClick={() => announceShopAction(`${wishlist.length} item${wishlist.length === 1 ? "" : "s"} saved for later.`)}><Heart size={16} /> Wishlist <b>{wishlist.length}</b></button>
              <button type="button" onClick={() => announceShopAction(`${cartCount} item${cartCount === 1 ? "" : "s"} in your project cart.`)}><ShoppingCart size={16} /> Cart <b>{cartCount}</b></button>
            </div>
          </div>

          <div className="shopping-section-heading"><div><span>CURATED DISCOVERY</span><h3>Featured categories</h3></div><button type="button" onClick={() => { setShopCategory("All"); setShopSearch(""); }}>View all categories <ArrowRight size={15} /></button></div>
          <div className="category-rail" aria-label="Product categories">
            {shopCategories.slice(1).map((category) => <button type="button" key={category} className={shopCategory === category ? "is-active" : ""} onClick={() => { setShopCategory(category); document.getElementById("shopping-products")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span className={`category-glyph glyph-${category.toLowerCase().replace(" ", "-")}`} />{category}</button>)}
          </div>

          <div className="brand-strip"><span>TOP BRANDS</span>{["Havells", "Anchor", "RR Kabel", "Padmavati", "Yuvraj", "Sirohi Select"].map((brand) => <button type="button" key={brand} onClick={() => setShopSearch(brand)}>{brand}</button>)}</div>

          <div className="shopping-section-heading product-heading" id="shopping-products"><div><span>{shopSearch || shopCategory === "All" ? "PROJECT CATALOG" : shopCategory.toUpperCase()}</span><h3>{shopSearch ? `Results for “${shopSearch}”` : "Feature products"}</h3></div><span className="result-count">{visibleShopProducts.length} available now</span></div>
          <div className="shop-product-grid">
            {visibleShopProducts.map((product) => { const ProductIcon = product.icon; const isSaved = wishlist.includes(product.name); return <article className="shop-product-card" key={product.name}>
              <div className={`shop-product-visual tone-${product.tone}`}><span className="shop-product-badge">{product.badge}</span><button type="button" className={`shop-wishlist ${isSaved ? "is-saved" : ""}`} aria-label={`${isSaved ? "Remove" : "Add"} ${product.name} ${isSaved ? "from" : "to"} wishlist`} onClick={() => toggleWishlist(product)}><Heart size={17} fill={isSaved ? "currentColor" : "none"} /></button><div className="shop-product-orbit" /><ProductIcon size={45} strokeWidth={1.35} /><small>{product.category}</small></div>
              <div className="shop-product-info"><div className="shop-product-brand">{product.brand}</div><h4>{product.name}</h4><p>{product.description}</p><div className="shop-product-rating"><Star size={13} fill="currentColor" /><b>{product.rating}</b><span>({product.reviews})</span></div><div className="shop-product-bottom"><strong>₹{product.price.toLocaleString("en-IN")}</strong><span>In stock</span></div><div className="shop-product-actions"><button type="button" className="product-buy" onClick={() => { addToCart(product); document.getElementById("shopping")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Buy now <ArrowUpRight size={14} /></button><button type="button" className="product-cart" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}><ShoppingCart size={16} /></button><button type="button" className="product-quick-view" onClick={() => setQuickViewProduct(product)} aria-label={`Quick view ${product.name}`}><Eye size={16} /></button></div></div>
            </article>; })}
          </div>
          {visibleShopProducts.length === 0 ? <div className="shop-empty"><Search size={25} /><strong>No products match that search yet.</strong><button type="button" onClick={() => { setShopSearch(""); setShopCategory("All"); }}>Reset discovery</button></div> : null}

          <div className="estimate-banner"><div><span>QUICK ESTIMATE</span><h3>Know what your project needs before you order.</h3><p>Use the live paint calculator and connect the right products with the right specialist.</p></div><a href="#features">Open project tools <ArrowRight size={16} /></a></div>
          <div className="newsletter-strip"><div><span>STAY UPDATED WITH OFFERS</span><strong>New stock, local drops, smarter project prices.</strong></div><form onSubmit={(event) => { event.preventDefault(); announceShopAction("You are on the Sirohi Point project updates list."); }}><input type="email" required placeholder="Enter your email" aria-label="Email for Sirohi Point offers" /><button type="submit" aria-label="Subscribe to offers"><Send size={15} /></button></form></div>
        </div>

        <AnimatePresence>
          {quickViewProduct ? <motion.div className="quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickViewProduct(null)}><motion.div className="quick-view-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: .96 }} onClick={(event) => event.stopPropagation()}><button type="button" className="quick-view-close" onClick={() => setQuickViewProduct(null)} aria-label="Close quick view"><X size={18} /></button><div className={`quick-view-visual tone-${quickViewProduct.tone}`}>{(() => { const QuickViewIcon = quickViewProduct.icon; return <QuickViewIcon size={70} strokeWidth={1.2} />; })()}</div><div className="quick-view-copy"><span>{quickViewProduct.brand} · {quickViewProduct.category}</span><h3 id="quick-view-title">{quickViewProduct.name}</h3><p>{quickViewProduct.description}</p><div className="shop-product-rating"><Star size={14} fill="currentColor" /><b>{quickViewProduct.rating}</b><span>{quickViewProduct.reviews} verified reviews</span></div><strong>₹{quickViewProduct.price.toLocaleString("en-IN")}</strong><button type="button" className="product-buy" onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}>Add to project cart <ShoppingCart size={15} /></button></div></motion.div></motion.div> : null}
        </AnimatePresence>
        {shopNotice ? <div className="shop-toast" role="status"><Check size={16} />{shopNotice}</div> : null}
      </section>

      <section className="world-scene fracture-world" id="fracture">
        <SceneHeading eyebrow="The gap today" title={<>Five searches stand between an idea and a <em>finished space.</em></>} copy="Materials, experts, pricing and transport live on disconnected islands. Every broken link adds time, uncertainty and avoidable cost." />
        <div className="broken-site">
          {disconnected.map(([label, copy, Icon], index) => <Reveal className={`broken-platform broken-${index + 1}`} key={label} delay={index * 0.06}><span><Icon size={22} /></span><strong>{label}</strong><small>{copy}</small>{index < disconnected.length - 1 ? <i className="broken-bridge" /> : null}</Reveal>)}
          <div className="site-floor"><i /><i /><i /></div>
        </div>
        <div className="transition-caption"><span>Scroll to reconnect the workflow</span><i /></div>
      </section>

      <section className="world-scene smart-city-world" id="platform">
        <SceneHeading eyebrow="One connected flow" title={<>The platform becomes the <em>orchestration layer.</em></>} copy="One requirement moves through discovery, comparison, verified expertise, installation and fulfilment without leaving the system." center />
        <div className="smart-city">
          <div className="city-core"><span><img src="/logo_sirohi.png" alt="" /></span><strong>SIROHI POINT</strong><small>LIVE PROJECT CORE</small><i /><i /><i /></div>
          {connected.map(([label, Icon], index) => <Reveal key={label} className={`city-node city-node-${index + 1}`} delay={index * 0.05}><Icon size={19} /><span>{label}</span><i /></Reveal>)}
        </div>
        <div className="system-proof"><span><Check /> One search</span><span><Check /> One comparison layer</span><span><Check /> One coordinated timeline</span><span><Check /> One accountable ecosystem</span></div>
      </section>

      <section className="world-scene cube-world">
        <div className="cube-copy"><SceneHeading eyebrow="Built for every transaction" title={<>Three engines power the <em>same universe.</em></>} copy="Consumer convenience, enterprise procurement and marketplace scale share one product, service and logistics foundation." /><div className="model-switcher">{businessModels.map(([label], index) => <button type="button" key={label} className={activeModel === index ? "is-active" : ""} onClick={() => setActiveModel(index)}>{label}</button>)}</div><Reveal className="model-detail"><span>{businessModels[activeModel][0]}</span><h3>{businessModels[activeModel][1]}</h3><p>{businessModels[activeModel][2]}</p></Reveal></div>
        <div className={`glass-cube-stage cube-state-${activeModel}`}>
          <div className="glass-cube"><div className="cube-face cube-front"><ShoppingBag /><b>B2C</b></div><div className="cube-face cube-right"><Building2 /><b>B2B</b></div><div className="cube-face cube-top"><Network /><b>MARKET</b></div><div className="cube-face cube-back" /></div>
          <div className="mirror-floor" /><div className="room room-a"><House /><span>Home</span></div><div className="room room-b"><Factory /><span>Enterprise</span></div><div className="room room-c"><Store /><span>Network</span></div>
        </div>
      </section>

      <section className="world-scene home-world">
        <SceneHeading eyebrow="Designed around real life" title={<>Buy once. <em>Coordinate everything.</em></>} copy="A homeowner chooses materials, matches verified specialists, schedules work and receives one coordinated delivery experience." />
        <div className="isometric-home">
          <div className="home-room kitchen"><span><House /></span><b>Kitchen</b><small>Fixtures + electrician</small></div><div className="home-room bathroom"><span><Wrench /></span><b>Bathroom</b><small>Fittings + plumber</small></div><div className="home-room living"><span><Palette /></span><b>Living room</b><small>Paint + painter</small></div><div className="home-room office"><span><Lightbulb /></span><b>Office</b><small>Lighting + setup</small></div>
          <motion.div className="worker worker-a" animate={{ x: [0, 25, 0] }} transition={{ duration: 5, repeat: Infinity }}><PlugZap /><span>Electrician</span></motion.div><motion.div className="worker worker-b" animate={{ x: [0, -20, 0] }} transition={{ duration: 5.8, repeat: Infinity }}><Paintbrush /><span>Painter</span></motion.div>
        </div>
        <div className="journey-rail"><span><b>01</b> Choose products</span><i /><span><b>02</b> Match expert</span><i /><span><b>03</b> Schedule work</span><i /><span><b>04</b> Receive together</span></div>
      </section>

      <section className="world-scene construction-world">
        <div className="construction-copy"><SceneHeading eyebrow="Procurement at project scale" title={<>From requirement to site, <em>without blind spots.</em></>} copy="Builders, contractors, retailers, designers, electricians and painters submit one RFQ, compare verified quotes and track bulk fulfilment." /><div className="trade-chips">{["Builders", "Contractors", "Retail shops", "Interior designers", "Construction firms", "Electricians", "Painters"].map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="b2b-site">
          <div className="crane"><i /><i /><b /></div><div className="building-frame">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div>
          <motion.div className="site-truck" animate={{ x: [-20, 40, -20] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><Truck /><span>48.6K units</span></motion.div>
          <div className="procurement-screen"><span>LIVE PROCUREMENT</span><strong>₹7.96L</strong><small>Best verified quote · 1 day lead</small><div><i /><i /><i /><i /><i /></div></div>
        </div>
      </section>

      <section className="world-scene marketplace-world">
        <SceneHeading eyebrow="The network effect" title={<>Every order moves through a <em>living digital city.</em></>} copy="Manufacturers, distributors, retailers, dealers, contractors and service providers become visible nodes in one responsive marketplace." center />
        <div className="digital-city">
          {[["Manufacturer", Factory], ["Distributor", Warehouse], ["Retailer", Store], ["Dealer", BriefcaseBusiness], ["Contractor", HardHat], ["Service", Wrench]].map(([label, Icon], index) => { const C = Icon as LucideIcon; return <div className={`digital-building building-${index + 1}`} key={label as string}><span><C /></span><b>{label as string}</b><i /><i /><i /></div>; })}
          <div className="laser laser-a" /><div className="laser laser-b" /><div className="laser laser-c" /><motion.div className="moving-package" animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}><Package /></motion.div>
        </div>
      </section>

      <section className="world-scene workshop-world" id="products">
        <SceneHeading eyebrow="Forged for the job" title={<>Specifications become <em>objects you can understand.</em></>} copy="Rugged hardware is presented with fit, finish, compatibility and service support—not as an endless undifferentiated catalog." />
        <div className="product-pedestals">{workshopProducts.map(([label, copy, Icon], index) => <Reveal className="product-pedestal" key={label} delay={index * .08}><div className="product-object"><i /><i /><span><Icon /></span></div><div className="pedestal-base"><small>0{index + 1} · EXPLODED VIEW</small><h3>{label}</h3><p>{copy}</p><button type="button">Inspect system <ArrowUpRight /></button></div></Reveal>)}</div>
      </section>

      <section className="world-scene electronics-world">
        <SceneHeading eyebrow="Engineered current" title={<>See every connection. <em>Trust every installation.</em></>} copy="Technical products are paired with load guidance, warranty context and verified electricians from the moment of discovery." />
        <div className="circuit-lab"><div className="lab-board"><i className="trace trace-a" /><i className="trace trace-b" /><i className="trace trace-c" />{Array.from({ length: 8 }).map((_, index) => <span key={index} className={`chip chip-${index + 1}`}><b /></span>)}</div><div className="electronic-products">{labProducts.map(([label, copy, Icon]) => <article key={label}><span><Icon /></span><div><h3>{label}</h3><p>{copy}</p></div><i /></article>)}</div></div>
      </section>

      <section className="world-scene paint-world">
        <SceneHeading eyebrow="Color in motion" title={<>Preview the feeling before <em>opening the first can.</em></>} copy="Paint, texture, waterproofing and skilled application become one visual decision instead of separate purchases." />
        <div className="paint-studio"><div className="paint-ribbon ribbon-a" /><div className="paint-ribbon ribbon-b" /><div className="paint-ribbon ribbon-c" /><div className="paint-can"><Palette /><span>Live color</span></div>{["#b86845", "#d5a457", "#4b7a81", "#736879", "#d9c9ad"].map((color, index) => <motion.i key={color} className={`paint-drop drop-${index + 1}`} style={{ background: color }} animate={{ y: [0, -16, 0], scale: [1, 1.08, 1] }} transition={{ duration: 3 + index * .3, repeat: Infinity }} />)}<div className="changing-wall" style={{ "--wall-color": paintColor } as CSSProperties}><span>Move through a living palette</span></div></div>
      </section>

      <section className="world-scene feature-world" id="features">
        <SceneHeading eyebrow="Tools that remove uncertainty" title={<>Every feature resolves a <em>real project decision.</em></>} copy="The intelligence stays practical: measure, preview, compare, locate, book and fulfil from one command layer." center />
        <div className="hologram-grid">
          <article className="holo-panel calculator-panel"><div className="panel-title"><Calculator /> Paint requirement <span>LIVE</span></div><label>Wall width <b>{wallWidth} ft</b><input type="range" min="8" max="40" value={wallWidth} onChange={(event) => setWallWidth(Number(event.target.value))} /></label><label>Wall height <b>{wallHeight} ft</b><input type="range" min="7" max="16" value={wallHeight} onChange={(event) => setWallHeight(Number(event.target.value))} /></label><label>Coats <b>{coats}</b><input type="range" min="1" max="4" value={coats} onChange={(event) => setCoats(Number(event.target.value))} /></label><div className="paint-result"><span><small>AREA</small><b>{paint.area} sq ft</b></span><span><small>QUANTITY</small><b>{paint.litres} L</b></span><span><small>ESTIMATE</small><b>₹{paint.cost.toLocaleString("en-IN")}</b></span></div></article>
          <article className="holo-panel preview-panel"><div className="panel-title"><Palette /> Virtual room <span>REALTIME</span></div><div className="mini-room" style={{ "--preview-paint": paintColor } as CSSProperties}><i className="mini-window" /><i className="mini-sofa" /><i className="mini-table" /><span>Wall preview</span></div><div className="swatches">{["#b86743", "#d2a15a", "#4f777b", "#776d85", "#d8c9ae"].map((color) => <button type="button" key={color} aria-label={`Preview ${color}`} className={paintColor === color ? "is-active" : ""} style={{ background: color }} onClick={() => setPaintColor(color)} />)}</div></article>
          <article className="holo-panel rfq-panel"><div className="panel-title"><BriefcaseBusiness /> Bulk RFQ <span>03 QUOTES</span></div>{[["Metro Supply", "₹8.42L"], ["BuildMart", "₹8.18L"], ["Sirohi Network", "₹7.96L"]].map(([vendor, quote], index) => <div className={index === 2 ? "selected" : ""} key={vendor}><span>{vendor}<small>{3 - index} day lead</small></span><b>{quote}</b></div>)}</article>
          <article className="holo-panel delivery-panel"><div className="panel-title"><Truck /> Hyperlocal route <span>27 MIN</span></div><div className="mini-map"><i className="route" /><span className="map-node node-a"><Warehouse /></span><span className="map-node node-b"><Store /></span><span className="map-node node-c"><MapPin /></span><motion.b animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity }}><Truck /></motion.b></div></article>
          <article className="holo-panel contractor-panel"><div className="panel-title"><HardHat /> Verified contractor <span>AVAILABLE</span></div><div className="contractor-card"><span><HardHat /></span><div><b>Rajesh Kumar</b><small>Electrical specialist · 4.9 ★</small></div><button type="button">Book</button></div><div className="availability"><i /><i /><i /><i /><i /><i /><i /></div></article>
        </div>
      </section>

      <section className="world-scene supply-world" id="network">
        <div className="supply-copy"><SceneHeading eyebrow="A live supply organism" title={<>Inventory, vehicles and cities move as <em>one connected network.</em></>} copy="Nearest-source fulfilment lowers transport cost while regional distributors and retailers retain control of stock, territory and pricing." /><div className="network-stats"><span><b>12</b> active regions</span><span><b>186</b> fulfilment nodes</span><span><b>94%</b> stock visibility</span></div></div>
        <div className="india-network"><div className="india-shape"><i /><span className="city delhi">Delhi<b /></span><span className="city jaipur">Jaipur<b /></span><span className="city ahmedabad">Ahmedabad<b /></span><span className="city mumbai">Mumbai<b /></span><span className="city bengaluru">Bengaluru<b /></span><span className="city hyderabad">Hyderabad<b /></span><span className="city kolkata">Kolkata<b /></span><span className="city chennai">Chennai<b /></span><motion.span className="network-truck" animate={{ x: [0, 90, 30, 0], y: [0, 45, 120, 0] }} transition={{ duration: 9, repeat: Infinity }}><Truck /></motion.span></div><div className="warehouse-card"><Warehouse /><span><b>Nearest hub</b><small>Sirohi regional center · 11 km</small></span><i>LIVE</i></div></div>
      </section>

      <section className={`world-scene portals-world portal-environment-${activeRole}`}>
        <SceneHeading eyebrow="One ecosystem, five perspectives" title={<>Step through the portal built for <em>your role.</em></>} copy="Every participant gets the controls they need while operating on the same trusted project record." center />
        <div className="portal-stage">{roleData.map(([label, copy, Icon], index) => <Portal key={label} label={label} copy={copy} Icon={Icon} active={activeRole === index} onClick={() => setActiveRole(index)} />)}</div>
        <div className="portal-console"><span>{String(activeRole + 1).padStart(2, "0")}</span><div><small>ACTIVE INTERFACE</small><strong>{roleData[activeRole][0]} command layer</strong><p>{roleData[activeRole][1]}—connected to the same orders, inventory, fulfilment and payment history.</p></div><ArrowRight /></div>
      </section>

      <section className="world-scene apps-world">
        <SceneHeading eyebrow="Five interfaces, one source of truth" title={<>The complete operation fits inside <em>a connected app family.</em></>} copy="Customer, vendor, contractor, distributor and admin experiences stay specialized without creating data silos." />
        <div className="phone-orbit">{appData.map(([label, action, Icon], index) => <Reveal className={`floating-phone phone-${index + 1}`} key={label} delay={index * .05}><div className="phone-camera" /><div className="phone-ui"><span className="phone-logo"><img src="/logo_sirohi.png" alt="" /></span><Icon /><small>{action}</small><h3>{label}</h3><div className="phone-chart"><i /><i /><i /><i /></div><div className="phone-lines"><i /><i /><i /></div></div></Reveal>)}</div>
      </section>

      <section className="world-scene finance-world">
        <div className="finance-copy"><SceneHeading eyebrow="A diversified economic engine" title={<>Revenue grows wherever the ecosystem <em>creates measurable value.</em></>} copy="Transactions, services, subscriptions, promotion, delivery and enterprise volume create balanced platform economics." /><div className="coin-stream">{Array.from({ length: 7 }).map((_, index) => <motion.i key={index} animate={{ x: [0, 170], y: [0, index % 2 ? 14 : -12], opacity: [0, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: index * .42 }}><Coins /></motion.i>)}</div></div>
        <div className="revenue-dashboard"><div className="dashboard-top"><span>ECOSYSTEM REVENUE</span><b>6 active streams</b></div><div className="revenue-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="revenue-list">{revenues.map(([label, copy, value]) => <article key={label}><span><b>{label}</b><small>{copy}</small></span><i style={{ "--value": value } as CSSProperties}><b /></i><strong>{value}</strong></article>)}</div></div>
      </section>

      <section className="world-scene data-world">
        <SceneHeading eyebrow="Enterprise foundations" title={<>A modern stack inside a <em>glass data center.</em></>} copy="The architecture connects web, mobile, services, data, cloud, payments and notifications as one scalable platform." />
        <div className="data-center"><div className="server-corridor">{Array.from({ length: 8 }).map((_, index) => <div className={`server-rack rack-${index + 1}`} key={index}>{Array.from({ length: 7 }).map((__, light) => <i key={light} />)}</div>)}<div className="fiber-line" /></div><div className="tech-chips">{technologies.map(([layer, tech, Icon]) => <article key={layer}><span><Icon /></span><small>{layer}</small><strong>{tech}</strong><i /></article>)}</div></div>
      </section>

      <section className="world-scene future-world" id="future">
        <SceneHeading eyebrow="The next city is already forming" title={<>Every home and construction need becomes <em>one digital district.</em></>} copy="Sirohi Point expands from today’s products and specialists into an end-to-end home, architecture and construction super app." center />
        <div className="future-city">{districts.map(([label, copy, Icon], index) => <Reveal className={`future-district district-${index + 1}`} key={label} delay={index * .05}><span><Icon /></span><small>DISTRICT {String(index + 1).padStart(2, "0")}</small><h3>{label}</h3><p>{copy}</p><i /><i /></Reveal>)}<div className="future-sun" /><div className="future-road road-a" /><div className="future-road road-b" /></div>
        <div className="vision-equation"><span>Product</span><i>+</i><span>Contractor</span><i>+</i><span>Installation</span><i>+</i><span>Delivery</span><i>+</i><span>Consultation</span><b>= ONE COMPLETE SOLUTION</b></div>
      </section>

      <section className="world-scene contact-world" id="contact">
        <div className="command-copy"><span className="signal-pill"><i /> Command center online</span><h2>Bring your next project into the <em>Sirohi universe.</em></h2><p>Tell us what you are building. We will connect the right products, suppliers, specialists and delivery path around it.</p><div className="contact-coordinates"><span><MapPin /> Sirohi, Rajasthan · India</span><span><Network /> Customer · Trade · Marketplace</span><span><Zap /> Hyperlocal + bulk ready</span></div></div>
        <form className={`command-form ${sent ? "is-sent" : ""}`} onSubmit={(event) => { event.preventDefault(); setSent(true); window.setTimeout(() => setSent(false), 4200); }}>
          <div className="form-status"><span><i /> SECURE PROJECT CHANNEL</span><small>Response within one business day</small></div>
          <label><span>Your name</span><input required name="name" placeholder="What should we call you?" /></label><label><span>Work email or phone</span><input required name="contact" placeholder="Where can we reach you?" /></label><label><span>Project requirement</span><select name="requirement" defaultValue=""><option value="" disabled>Select an entry point</option><option>Home products + services</option><option>Contractor booking</option><option>Bulk B2B requirement</option><option>Sell on the marketplace</option><option>Distribution partnership</option></select></label><label><span>Project brief</span><textarea name="message" placeholder="Materials, location, quantities or the outcome you need…" rows={4} /></label>
          <button type="submit"><span>{sent ? "Message launched" : "Send to command center"}</span>{sent ? <Check /> : <Send />}</button>
          {sent ? <div className="send-particles" aria-hidden="true">{Array.from({ length: 12 }).map((_, index) => <i key={index} style={{ "--particle": index } as CSSProperties} />)}</div> : null}
        </form>
      </section>

      <footer className="night-footer"><div className="footer-skyline" aria-hidden="true">{Array.from({ length: 14 }).map((_, index) => <i key={index} />)}</div><div className="footer-brand"><span><img src="/logo_sirohi.png" alt="Sirohi Point" /></span><div><strong>SIROHI POINT</strong><small>THE DIGITAL CONSTRUCTION UNIVERSE</small></div></div><div className="footer-links"><a href="#platform">Connected platform</a><a href="#products">Product worlds</a><a href="#network">Supply network</a><a href="#future">Future vision</a><a href="#contact">Command center</a></div><div className="footer-bottom"><span>© 2026 Sirohi Point. All systems connected.</span><span>Hardware · Electronics · Painting · Services · Logistics</span></div></footer>
    </main>
  );
}
