import { PLAZA_CENTER, type Building, type BuildingShape } from '@/data/buildings'

/** How far in front of a building's centre its door sits, toward the plaza. */
const DOOR_DISTANCE: Record<BuildingShape, number> = {
  gate: 1.4,
  hall: 3.2,
  arena: 3.5,
  house: 2.8,
  hub: 3.0,
  office: 2.8,
}

/** Rotation that turns a building's front (+z) to face the plaza. */
export function facingPlaza([x, z]: [number, number]) {
  return Math.atan2(PLAZA_CENTER[0] - x, PLAZA_CENTER[1] - z)
}

/** The ground point an avatar walks to before entering. */
export function doorPoint(b: Building): [number, number] {
  const angle = facingPlaza(b.position)
  const d = DOOR_DISTANCE[b.shape]
  return [b.position[0] + Math.sin(angle) * d, b.position[1] + Math.cos(angle) * d]
}

/** Height (world units) at which a building's floating name label sits above its roof. */
export function labelHeight(shape: BuildingShape) {
  switch (shape) {
    case 'hall':
      return 9.4
    case 'house':
      return 7.2
    case 'hub':
      return 7.0
    case 'office':
      return 6.2
    case 'gate':
      return 5.2
    case 'arena':
      return 4.6
  }
}
