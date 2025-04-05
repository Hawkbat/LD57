
export function moveAngleTowards(a: number, b: number, t: number): number {
    let delta = b - a
    if (Math.abs(delta) > Math.PI) {
        // Adjust the angle to be within the range of -PI to PI
        if (delta > 0) {
            b -= 2 * Math.PI
        } else {
            b += 2 * Math.PI
        }
        delta = b - a
    }

    if (Math.abs(delta) < t) {
        return b
    }
    return a + Math.sign(delta) * t
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}
