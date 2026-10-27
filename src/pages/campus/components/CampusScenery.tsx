import { useMemo } from 'react'
import { DoubleSide } from 'three'

/* ---------------------------------------------------------------- Stylized 3D Trees & Flora ---------------------------------------------------------------- */

/** SPU Signature Pink Tabebuia Tree (ต้นชมพูพันธุ์ทิพย์ ดอกไม้ประจำมหาลัย) */
export function PinkTabebuiaTree({
  position,
  scale = 1,
  rotation = 0,
}: {
  position: [number, number, number]
  scale?: number
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Organic tapered trunk */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.22, 1.8, 8]} />
        <meshStandardMaterial color="#6E5039" roughness={0.85} />
      </mesh>
      {/* Root flares */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.35, 0.2, 8]} />
        <meshStandardMaterial color="#5C422F" roughness={0.9} />
      </mesh>

      {/* Layered soft blossom canopy */}
      <group position={[0, 2.2, 0]}>
        {/* Lower blossom dome */}
        <mesh position={[0, 0, 0]} castShadow>
          <dodecahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial color="#F472B6" roughness={0.7} />
        </mesh>
        {/* Mid blossom tier */}
        <mesh position={[0.3, 0.6, -0.1]} castShadow>
          <dodecahedronGeometry args={[0.82, 1]} />
          <meshStandardMaterial color="#FB7185" roughness={0.65} />
        </mesh>
        <mesh position={[-0.35, 0.5, 0.2]} castShadow>
          <dodecahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#F472B6" roughness={0.7} />
        </mesh>
        {/* Crown highlight blossom */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <dodecahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial color="#FDA4AF" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/** Lush Green Shade Tree (ต้นไม้ใหญ่ร่มรื่น) */
export function CanopyTree({
  position,
  scale = 1,
  color = '#22C55E',
  crownColor = '#4ADE80',
}: {
  position: [number, number, number]
  scale?: number
  color?: string
  crownColor?: string
}) {
  return (
    <group position={position} scale={scale}>
      {/* Tree Trunk */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.24, 2.0, 8]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>

      {/* Lush Foliage Clusters */}
      <group position={[0, 2.3, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <dodecahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.55, 0.2]} castShadow>
          <dodecahedronGeometry args={[0.85, 1]} />
          <meshStandardMaterial color={crownColor} roughness={0.75} />
        </mesh>
        <mesh position={[-0.4, 0.45, -0.2]} castShadow>
          <dodecahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <dodecahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial color={crownColor} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

/** Tropical Palm Tree (ต้นปาล์ม / มะพร้าวประดับริมน้ำ) */
export function TropicalPalm({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      {/* Segmented leaning trunk */}
      <mesh position={[0.1, 1.5, 0]} rotation={[0, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 3.0, 8]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.85} />
      </mesh>

      {/* Palm Fronds Crown */}
      <group position={[0.22, 3.0, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const ang = (i * Math.PI) / 3
          return (
            <group key={i} rotation={[0, ang, 0]}>
              <mesh position={[0.7, -0.15, 0]} rotation={[0, 0, -0.35]} castShadow>
                <boxGeometry args={[1.3, 0.04, 0.42]} />
                <meshStandardMaterial color="#10B981" roughness={0.65} side={DoubleSide} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- 1. SPU Sports & Basketball Arena ---------------------------------------------------------------- */

export function SPUSportsCourt({ position }: { position: [number, number, number] }) {
  const courtW = 12
  const courtL = 8

  return (
    <group position={position}>
      {/* Acrylic Court Surface (SPU Navy + Terracotta) */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[courtW, 0.06, courtL]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
      </mesh>

      {/* Inner Key Areas (Terracotta Red) */}
      <mesh position={[-courtW / 2 + 1.8, 0.045, 0]}>
        <boxGeometry args={[3.2, 0.01, 3.6]} />
        <meshStandardMaterial color="#C2410C" roughness={0.7} />
      </mesh>
      <mesh position={[courtW / 2 - 1.8, 0.045, 0]}>
        <boxGeometry args={[3.2, 0.01, 3.6]} />
        <meshStandardMaterial color="#C2410C" roughness={0.7} />
      </mesh>

      {/* Center Circle & Half-court line */}
      <mesh position={[0, 0.048, 0]}>
        <boxGeometry args={[0.1, 0.01, courtL - 0.4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.049, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.2, 24]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Court Perimeter Boundary White Lines */}
      {[-courtL / 2 + 0.15, courtL / 2 - 0.15].map((zPos, idx) => (
        <mesh key={idx} position={[0, 0.048, zPos]}>
          <boxGeometry args={[courtW - 0.3, 0.01, 0.08]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Basketball Hoops (Left & Right Ends) */}
      {[-courtW / 2 + 0.5, courtW / 2 - 0.5].map((hx, idx) => {
        const isLeft = idx === 0
        return (
          <group key={idx} position={[hx, 0, 0]} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
            {/* Sturdy steel post */}
            <mesh position={[0, 1.5, -0.6]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 3.0, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Overhang Arm */}
            <mesh position={[0, 2.9, -0.2]} rotation={[0.4, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.9]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Transparent Acrylic Backboard */}
            <mesh position={[0, 2.9, 0.2]} castShadow>
              <boxGeometry args={[1.4, 0.9, 0.05]} />
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.7} roughness={0.1} clearcoat={1} />
            </mesh>
            {/* Backboard Inner Target Box */}
            <mesh position={[0, 2.75, 0.23]}>
              <boxGeometry args={[0.5, 0.4, 0.02]} />
              <meshBasicMaterial color="#DC2626" />
            </mesh>
            {/* Orange Rim */}
            <mesh position={[0, 2.65, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.03, 8, 16]} />
              <meshStandardMaterial color="#EA580C" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Spectator Bleachers (3-tier wooden seating) */}
      <group position={[0, 0, courtL / 2 + 1.2]}>
        {[0, 1, 2].map((tier) => (
          <mesh key={tier} position={[0, 0.2 + tier * 0.25, tier * 0.4]} castShadow receiveShadow>
            <boxGeometry args={[8.0, 0.22, 0.45]} />
            <meshStandardMaterial color="#854D0E" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 4 Corner Sports Arena Floodlight Towers */}
      {[
        [-courtW / 2 - 0.5, -courtL / 2 - 0.5],
        [courtW / 2 + 0.5, -courtL / 2 - 0.5],
        [-courtW / 2 - 0.5, courtL / 2 + 0.5],
        [courtW / 2 + 0.5, courtL / 2 + 0.5],
      ].map(([fx, fz], idx) => (
        <group key={idx} position={[fx, 0, fz]}>
          <mesh position={[0, 2.6, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.11, 5.2, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Floodlight Fixture */}
          <mesh position={[0, 5.2, 0]} castShadow>
            <boxGeometry args={[0.8, 0.35, 0.3]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Luminous LED panels */}
          <mesh position={[0, 5.2, 0.16]}>
            <planeGeometry args={[0.7, 0.25]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFF8D6" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- 2. SPU Botanical Pavilion & Zen Garden ---------------------------------------------------------------- */

export function SPURestPavilion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stone Foundation Plinth */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.3, 6]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.7} />
      </mesh>

      {/* Polished Teakwood Floor Deck */}
      <mesh position={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.4, 0.06, 6]} />
        <meshStandardMaterial color="#9A3412" roughness={0.5} />
      </mesh>

      {/* 6 Wooden Pavilion Pillars */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const ang = (i * Math.PI) / 3
        const r = 2.05
        return (
          <mesh key={i} position={[Math.cos(ang) * r, 1.45, Math.sin(ang) * r]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.2, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
        )
      })}

      {/* Traditional Hip Roof Canopy */}
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.3, 3.1, 1.1, 6]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} />
      </mesh>
      {/* Roof Finial Top */}
      <mesh position={[0, 3.7, 0]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging Warm Japanese / Modern Thai Lantern */}
      <group position={[0, 2.3, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.35, 8]} />
          <meshStandardMaterial color="#FFFBEB" emissive="#FDE68A" emissiveIntensity={2.2} />
        </mesh>
      </group>

      {/* Round Wooden Table & Low Stools */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 12]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.25, 8]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- 3. SPU Open-Air Cafe & Student Terrace ---------------------------------------------------------------- */

export function SPUCoffeeTerrace({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Wooden Decking Platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#A16207" roughness={0.65} />
      </mesh>

      {/* Coffee Kiosk Booth */}
      <group position={[-1.4, 0, 0]}>
        {/* Main Kiosk Body */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.1, 2.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} />
        </mesh>
        {/* Service Counter Opening */}
        <mesh position={[0.91, 1.0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 2.2]} />
          <meshStandardMaterial color="#D97706" roughness={0.3} />
        </mesh>
        {/* Striped SPU Pink & Cream Awning */}
        <mesh position={[1.15, 1.9, 0]} rotation={[0, 0, -0.35]} castShadow>
          <boxGeometry args={[0.95, 0.05, 2.6]} />
          <meshStandardMaterial color="#EC4899" roughness={0.7} />
        </mesh>
        {/* Signboard: "SPU COFFEE" */}
        <mesh position={[0.92, 2.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.8, 0.35]} />
          <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Outdoor Cafe Tables with SPU Pink-Striped Parasols */}
      {[
        [0.8, -1.0],
        [0.8, 1.0],
      ].map(([tx, tz], idx) => (
        <group key={idx} position={[tx, 0, tz]}>
          {/* Table */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.06, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Parasol Pole */}
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          {/* Parasol Umbrella Dome */}
          <mesh position={[0, 2.25, 0]} castShadow>
            <coneGeometry args={[1.1, 0.45, 12]} />
            <meshStandardMaterial color="#EC4899" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Warm Fairy Light Post with hanging festoon string */}
      <group position={[2.2, 0, 1.6]}>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.6, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Glowing bulb */}
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- 4. SPU Smart Mobility Station (Scooters & EV Bikes) ---------------------------------------------------------------- */

export function SPUMobilityStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Concrete Paved Base */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.06, 2.2]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.7} />
      </mesh>

      {/* Modern Solar Glass Canopy Shelter */}
      <mesh position={[0, 2.1, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[4.4, 0.08, 2.4]} />
        <meshPhysicalMaterial color="#0284C7" transmission={0.6} roughness={0.1} />
      </mesh>
      {/* Canopy Support Posts */}
      {[-1.8, 1.8].map((px) => (
        <mesh key={px} position={[px, 1.0, -0.9]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.0, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
      ))}

      {/* Row of Parked Colorful Electric Scooters */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((sx, idx) => {
        const colors = ['#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#6366F1']
        return (
          <group key={idx} position={[sx, 0.08, 0]} rotation={[0, 0.15, 0]}>
            {/* Scooter Deck */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.85]} />
              <meshStandardMaterial color={colors[idx % colors.length]} />
            </mesh>
            {/* Handlebar Stem */}
            <mesh position={[0, 0.45, 0.35]} rotation={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.75, 6]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0, 0.78, 0.3]}>
              <boxGeometry args={[0.35, 0.03, 0.03]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            {/* Tiny Glowing Status LED */}
            <mesh position={[0, 0.8, 0.3]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color="#10B981" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ---------------------------------------------------------------- 5. SPU Creative Art "Loop of Knowledge" Sculpture ---------------------------------------------------------------- */

export function SPUInfinitySculpture({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Circular Architectural Granite Pedestal */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.5, 24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Chrome Torus Ribbon (Infinity Loop) */}
      <mesh position={[0, 1.7, 0]} rotation={[0.8, 0.5, 0.4]} castShadow>
        <torusGeometry args={[0.9, 0.18, 16, 32]} />
        <meshStandardMaterial color="#E89BC4" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* SPU Pink Inner Glow Sphere */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={1.8} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- Master Campus Scenery Assembler ---------------------------------------------------------------- */

export default function CampusScenery() {
  const treePositions = useMemo(
    () => [
      // ── SPU Signature Pink Tabebuia Trees (Along wide pedestrian avenues) ──
      { pos: [-6.5, 0, 9.5], scale: 1.15 },
      { pos: [2.5, 0, 15.5], scale: 1.2 },
      { pos: [14.0, 0, 16.5], scale: 1.25 },
      { pos: [9.5, 0, 16.0], scale: 1.05 },
      { pos: [24.0, 0, 10.5], scale: 1.1 },
      { pos: [-1.5, 0, -14.5], scale: 1.1 },
      { pos: [8.5, 0, -14.5], scale: 1.0 },
      { pos: [-16.5, 0, 3.5], scale: 1.15 },
      { pos: [-11.5, 0, -16.5], scale: 1.2 },

      // ── Lush Green Shade Trees (Park perimeter, court boundary, background green) ──
      { pos: [28.0, 0, 24.0], scale: 1.35, color: '#16A34A', crown: '#4ADE80' },
      { pos: [12.5, 0, 26.0], scale: 1.25, color: '#15803D', crown: '#22C55E' },
      { pos: [20.0, 0, 28.0], scale: 1.3, color: '#16A34A', crown: '#4ADE80' },
      { pos: [-8.5, 0, 22.5], scale: 1.2, color: '#15803D', crown: '#22C55E' },
      { pos: [2.0, 0, 24.5], scale: 1.25, color: '#16A34A', crown: '#4ADE80' },
      { pos: [-20.5, 0, -14.5], scale: 1.3, color: '#15803D', crown: '#22C55E' },
      { pos: [-24.0, 0, -22.0], scale: 1.4, color: '#16A34A', crown: '#4ADE80' },
      { pos: [25.0, 0, -22.0], scale: 1.35, color: '#15803D', crown: '#22C55E' },
      { pos: [28.0, 0, -10.0], scale: 1.2, color: '#16A34A', crown: '#4ADE80' },

      // ── Tropical Palms (By the pond & entrance avenue) ──
      { pos: [5.5, 0, 8.0], scale: 1.1 },
      { pos: [12.0, 0, 14.5], scale: 1.15 },
      { pos: [-12.5, 0, 8.0], scale: 1.05 },
    ],
    [],
  )

  return (
    <group>
      {/* ── 1. SPU Sports Arena: Outdoor Basketball / Futsal Court (North-East lawn) ── */}
      <SPUSportsCourt position={[20, 0, 22]} />

      {/* ── 2. SPU Botanical Pavilion & Zen Rest Gazebo (East lawn by pond) ── */}
      <SPURestPavilion position={[24, 0, 6.5]} />

      {/* ── 3. SPU Open-Air Coffee Terrace & Sun Umbrella Tables (East of Plaza) ── */}
      <SPUCoffeeTerrace position={[14, 0, -6.5]} />

      {/* ── 4. SPU Smart Mobility Station: Scooters & EV Bikes (Near Entrance & Viaduct) ── */}
      <SPUMobilityStation position={[-20, 0, 8]} />

      {/* ── 5. SPU Contemporary Art Infinity Sculpture (South-West lawn) ── */}
      <SPUInfinitySculpture position={[-18, 0, -22]} />

      {/* ── 6. Master Stylized Tree Canopy & Nature Flora across Campus ── */}
      {treePositions.map((t, idx) => {
        if (t.crown) {
          return (
            <CanopyTree
              key={idx}
              position={t.pos as [number, number, number]}
              scale={t.scale}
              color={t.color}
              crownColor={t.crown}
            />
          )
        }
        if (idx >= treePositions.length - 3) {
          return (
            <TropicalPalm
              key={idx}
              position={t.pos as [number, number, number]}
              scale={t.scale}
            />
          )
        }
        return (
          <PinkTabebuiaTree
            key={idx}
            position={t.pos as [number, number, number]}
            scale={t.scale}
            rotation={idx * 0.7}
          />
        )
      })}
    </group>
  )
}
