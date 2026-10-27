import { PLAZA_CENTER, type Building, type BuildingShape } from '@/data/buildings'

/** How far in front of a building's centre its door sits, toward the plaza. */
const DOOR_DISTANCE: Record<BuildingShape, number> = {
  gate: 1.2,
  hall: 3,
  arena: 3.3,
  house: 2.6,
  hub: 2.9,
  office: 2.7,
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

/** Height (world units) at which a building's floating name label sits. */
const LABEL_HEIGHT: Record<BuildingShape, number> = {
  gate: 4.4,
  hall: 11.2,
  hub: 11.6,
  office: 7.3,
  house: 7.5,
  arena: 5.2,
}

export function labelHeight(shape: BuildingShape) {
  return LABEL_HEIGHT[shape]
}
