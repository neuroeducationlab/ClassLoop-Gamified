import { Environment, Lightformer, Sky } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing'

/** Low golden-hour sun, behind-right of the camera so facades catch warm light. */
const SUN: [number, number, number] = [30, 14, 22]
const HAZE = '#E9C9A8'

/**
 * Golden-hour sky, sun + shadows, and a reflection environment built from
 * Lightformers (no HDR file to download). Shared by the campus and the landing page.
 */
export default function Atmosphere({ lowPower, fogNear = 45, fogFar = 95 }: { lowPower: boolean; fogNear?: number; fogFar?: number }) {
  return (
    <>
      <Sky sunPosition={SUN} turbidity={7} rayleigh={2.2} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={[HAZE, fogNear, fogFar]} />
      <hemisphereLight args={['#FFE9D0', '#7A6A58', 0.9]} />
      <directionalLight
        position={SUN}
        intensity={2.6}
        color="#FFD3A1"
        castShadow
        shadow-mapSize={lowPower ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={120}
      />
      <Environment resolution={lowPower ? 64 : 256} frames={1}>
        {/* warm sunset band + cool sky dome = believable glass and water reflections */}
        <Lightformer form="rect" intensity={3} color="#FFB877" position={[20, 4, 10]} scale={[30, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#9FB8E6" position={[0, 25, 0]} scale={[60, 60, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#E7A0C8" position={[-20, 6, -10]} scale={[25, 5, 1]} target={[0, 0, 0]} />
      </Environment>
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={1.2} intensity={1.6} distanceFalloff={0.6} halfRes />
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} mipmapBlur />
          <Vignette offset={0.25} darkness={0.55} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  )
}
