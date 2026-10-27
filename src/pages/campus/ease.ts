/** Eased 0–1 curves shared by the camera moves (landing dive, room glides). */
export const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Zero velocity *and* acceleration at both ends: no jolt when a move starts or stops. */
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
