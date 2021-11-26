//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Point
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get position() {
        return [this.x, this.y];
    }

    clone() {
        return new Point(this.x, this.y);
    }

    delta(point) {
        return [this.x - point.x, this.y - point.y];
    }

    distance(point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    move(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    moveAtAngle(angle, distance) {
        this.x += Math.cos(angle) * distance;
        this.y += Math.sin(angle) * distance;
        return this;
    }

    applyVelocity(velocity) {
        this.x += velocity.vx;
        this.y += velocity.vy;
        return this;
    }

    angleRadians(point) {
        // radians = atan2(deltaY, deltaX)
        const y = point.y - this.y;
        const x = point.x - this.x;
        return Math.atan2(y, x);
    }

    angleDeg(point) {
        // degrees = atan2(deltaY, deltaX) * (180 / PI)
        const y = point.y - this.y;
        const x = point.x - this.x;
        return Math.atan2(y, x) * (180 / Math.PI);
    }

    rotate(origin, radians) {
        // rotate the point around a given origin point
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        this.x =
            cos * (this.x - origin.x) + sin * (this.y - origin.y) + origin.x;
        this.y =
            cos * (this.y - origin.y) - sin * (this.x - origin.x) + origin.y;
        return this;
    }
}

class Entity {
    dpr = window.devicePixelRatio || 1;
    toValue = value => value * this.dpr;
    draw = () => {};
    update = () => {};
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Spring
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Spring extends Point {
    constructor({
        x,
        y,
        isFixed,
        mass = 10,
        elasticity = 0.4,
        damping = 0.05,
    }) {
        super(x, y);
        this.ox = x; // original origin x, never changes
        this.oy = y; // original origin y, never changes
        this.vx = 0; // velocity x
        this.vy = 0; // velocity y
        this.fx = 0; // force x
        this.fy = 0; // force y

        this.isFixed = isFixed; // indeicates whether this point can be moved

        // spring constants
        this.mass = mass;
        this.elasticity = elasticity;
        this.damping = damping;
    }

    applyForce(x, y) {
        this.fx += x;
        this.fy += y;
    }

    attractors = []; // just testing

    addAttractor(point) {
        this.attractors = [...this.attractors, point];
    }

    setAdjacentForces() {
        // currently unused, was testing out an
        this.attractors.forEach((point, i) => {
            const { x, y } = point;

            const force = { x: 0, y: 0 }; // prev point force
            const { x: x1, y: y1 } = point;
            const { x: x2, y: y2 } = this;

            force.x = x1 - x2;
            force.y = y1 - y2;

            // apply adjacent forces to current spring
            this.applyForce(force.x, force.y);
        });
    }

    setSpringForce() {
        // force to origin, difference multiplied by elasticity constant
        const fx = (this.ox - this.x) * this.elasticity;
        const fy = (this.oy - this.y) * this.elasticity;

        // sum forces
        this.fx += fx;
        this.fy += fy;
    }

    solveVelocity() {
        if (this.fx === 0 && this.fy === 0) return;

        // acceleration = force / mass;
        const ax = this.fx / this.mass;
        const ay = this.fy / this.mass;

        // velocity, apply damping then ad acceleration
        this.vx = this.damping * this.vx + ax;
        this.vy = this.damping * this.vy + ay;

        // add velocity to center and top/left
        this.x += this.vx;
        this.y += this.vy;

        // reset any applied forces
        this.fx = 0;
        this.fy = 0;
    }

    update = ({ pointer }) => {
        if (this.isFixed) return;
        this.setSpringForce();
        this.setAdjacentForces();
        this.solveVelocity();
    };

    draw = ({ ctx }) => {
        // temporary, just to see what's happening
        const { x, y } = this;
        ctx.fillStyle = 'white';
        ctx.lineWidth = 5;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Link
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

// defaults and constants

const DPR = window.devicePixelRatio || 1;
const MOUSE_STRENGTH = 0.7; // 0 - 1
const MOUSE_RADIUS = 100 * DPR;

class Link extends Point {
    constructor({ x, y, isFixed, mass = 2.8 }) {
        super(x, y);
        this.vx = 0; // velocity x
        this.vy = 0; // velocity y
        this.fx = 0; // force x
        this.fy = 0; // force y
        this.mass = mass;
        this.links = [];
        this.restingDist = null;
        this.isFixed = isFixed; // indicates whether this point can be moved
        this.iterations = Array(10).fill(null); // more solutions, more accurate
    }

    applyForce(x, y) {
        this.fx += x;
        this.fy += y;
    }

    addLink(point) {
        this.links = [...this.links, point];
        this.links = this.links.map(link => {
            if (link.restingDist) return link;
            link.restingDist = link.distance(this);
            return link;
        });
    }

    solveLinks() {
        // verlet relax constraints solution
        // solve multiple time for accuracy
        this.iterations.forEach(() => {
            this.links.forEach((link, i) => {
                const { restingDist } = link;
                const currentDist = link.distance(this);
                const [diffX, diffY] = link.delta(this);

                // difference scalar
                const diff = (restingDist - currentDist) / currentDist;

                // translation for each axis
                // pushed 1/2 the required distance to match their resting distances.
                const translateX = diffX * 0.5 * diff;
                const translateY = diffY * 0.5 * diff;

                !this.isFixed && this.move(-translateX, -translateY);
                !link.isFixed && link.move(translateX, translateY);

                !this.isFixed && this.applyForce(-translateX, -translateY);
                !link.isFixed && link.applyForce(translateX, translateY);
            });
        });
    }

    applyForceFromMouse(pointer) {
        const { x, y } = pointer.position;

        const distance = this.distance(pointer.position);

        if (distance < MOUSE_RADIUS) {
            const [dx, dy] = pointer.delta();
            const power = (1 - distance / MOUSE_RADIUS) * MOUSE_STRENGTH;

            this.applyForce(dx * power, dy * power);
        }
    }

    solveVelocity(tick) {
        if ((this.fx === 0 && this.fy === 0) || this.isFixed) return;

        // acceleration = force / mass;
        const ax = this.fx / this.mass;
        const ay = this.fy / this.mass;

        // velocity + acceleration
        this.vx = this.vx + ax;
        this.vy = this.vy + ay;

        // add velocity to center and top/left
        this.x += this.vx;
        this.y += this.vy;

        // reset any applied forces
        this.fx = 0;
        this.fy = 0;

        // baseline
        const maxY = DPR * window.innerHeight;
        if (this.y > maxY) {
            this.y = maxY;
            this.vy = 0;
            this.vx = this.vx / 2; // fake horizontal friction
        }
    }

    update = ({ pointer, tick }) => {
        if (this.isFixed) return;
        this.applyForceFromMouse(pointer);
        this.solveLinks();
        this.solveVelocity(tick);
    };

    draw = ({ ctx }) => {
        // temporary, just to see what's happening
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Body
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Body extends Entity {
    constructor({ width, height, position, resolution, color }) {
        super();
        this.width = width;
        this.color = color;
        this.height = height;
        this.position = position;
        this.resolution = resolution;
        this.spine = [];

        this.constructSpine();
        this.setLinks(this.spine);
    }

    constructSpine() {
        const amount = this.height / this.resolution;
        const pointAmt = Math.round(amount);
        const offY = this.height / pointAmt;
        const x = this.position.x;

        for (let i = 0; i <= pointAmt; i++) {
            const y = this.position.y - offY * i;
            const point = new Link({
                x,
                y,
                isFixed: i === 0,
            });
            this.spine.push(point);
        }
    }

    setLinks(points) {
        points.forEach((point, i) => {
            const isLast = i === points.length - 1;
            const isFirst = i === 0;
            if (isLast) {
                const prevPoint = points[i - 1];
                point.addLink(prevPoint);
            } else if (isFirst) {
                const nextPoint = points[i + 1];
                point.addLink(nextPoint);
            } else {
                const prevPoint = points[i - 1];
                const nextPoint = points[i + 1];
                point.addLink(prevPoint);
                point.addLink(nextPoint);
            }
        });
    }

    draw = ({ ctx }) => {
        // base
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.width / 2,
            0,
            Math.PI,
            true
        );
        ctx.closePath();
        ctx.fill();

        // spine
        ctx.beginPath();
        this.spine.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    update = context => {
        const fy = Math.abs(Math.sin(context.tick / 40)) * -1 - 1;

        this.spine.forEach(point => {
            point.applyForce(Math.sin(context.tick / 100) * 0.1, fy);
            point.update(context);
        });
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Arm
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Arm extends Entity {
    constructor({ joint, length, resolution, color, mass, width }) {
        super();
        this.joint = joint;
        this.length = length;
        this.width = width;
        this.resolution = resolution;
        this.color = color;
        this.points = [this.joint];
        this.mass = mass;

        this.constructArm();
        this.setLinks(this.points);
    }

    constructArm() {
        const pointAmt = Math.round(this.length / this.resolution);
        const offY = this.length / pointAmt;
        const x = this.joint.x;
        const armPoints = Math.round(this.length / this.resolution);

        for (let i = 0; i <= armPoints; i++) {
            const y = this.joint.y - offY * i;
            const isFirst = i === 0;
            const point = new Link({
                x,
                y,
                mass: this.mass,
            });

            if (isFirst) {
                point.addLink(this.joint);
            }

            this.points.push(point);
        }
    }

    setLinks(points) {
        points.forEach((point, i) => {
            const isLast = i === points.length - 1;
            const isFirst = i === 0;
            if (isLast) {
                const prevPoint = points[i - 1];
                point.addLink(prevPoint);
            } else if (isFirst) {
                const nextPoint = points[i + 1];
                point.addLink(nextPoint);
            } else {
                const prevPoint = points[i - 1];
                const nextPoint = points[i + 1];
                point.addLink(prevPoint);
                point.addLink(nextPoint);
            }
        });
    }

    draw = ({ ctx }) => {
        // base
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.joint.x,
            this.joint.y,
            this.width / 2,
            0,
            Math.PI * 2,
            true
        );
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.lineWidth = this.width;
        ctx.stroke();
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Arms
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Arms {
    constructor({ p1, p2, shoulderWidth, length, width, resolution, color }) {
        this.tan = new Tangent({ p1, p2, width: shoulderWidth });

        const config = {
            length,
            width,
            resolution,
            color,
        };

        this.la = new Arm({
            ...config,
            joint: this.tan.t1,
        });

        this.ra = new Arm({
            ...config,
            joint: this.tan.t2,
        });
    }

    draw = ({ ctx }) => {
        this.la.draw({ ctx });
        this.ra.draw({ ctx });
    };

    update = context => {
        const fy = Math.abs(Math.sin(context.tick / 40)) * -1 - 1;

        const sin = Math.sin(context.tick / 100);

        this.tan.update();

        this.la.points.forEach(point => {
            point.applyForce(sin * 0.1 - 1, fy);
            point.update(context);
            // context.ctx.fillStyle = 'white';
            // context.ctx.fillRect(point.x, point.y, 10, 10);
        });

        this.ra.points.forEach(point => {
            point.applyForce(sin * 0.1 + 1, fy);
            point.update(context);
        });
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Tangent
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Tangent {
    constructor({ p1, p2, width }) {
        this.p1 = p1;
        this.p2 = p2;
        this.width = width;
        this.hw = width / 2;
        this.theta = 0;
        this.deltaTheta = 0;
        this.pi2 = Math.PI / 2;

        this.setCenter();
        this.createTangentPoints();
        this.setAngle();
        this.moveTangentPoints();
    }

    setCenter() {
        const [x, y] = this.p1.position;
        const [dx, dy] = this.p1.delta(this.p2);
        const cx = x - dx / 2;
        const cy = y - dy / 2;
        if (this.center) {
            this.center.moveTo(cx, cy);
        } else {
            this.center = new Point(cx, cy);
        }
    }

    createTangentPoints() {
        this.t1 = new Link({
            x: this.center.x,
            y: this.center.y,
            isFixed: true,
        });
        this.t2 = new Link({
            x: this.center.x,
            y: this.center.y,
            isFixed: true,
        });
        this.t1.moveAtAngle(this.theta, -this.hw);
        this.t2.moveAtAngle(this.theta, this.hw);
    }

    moveTangentPoints() {
        this.t1
            .moveTo(this.center.x, this.center.y)
            .moveAtAngle(this.theta + this.pi2, -this.hw);
        this.t2
            .moveTo(this.center.x, this.center.y)
            .moveAtAngle(this.theta + this.pi2, this.hw);
    }

    setAngle() {
        const theta = this.p1.angleRadians(this.p2);
        this.deltaTheta = theta - this.theta;
        this.theta = theta;
    }

    draw = () => {};

    update = () => {
        this.setCenter();
        this.setAngle();
        this.moveTangentPoints();
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Cursor
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Cursor extends Entity {
    constructor({ color, radius }) {
        super();
        this.radius = this.toValue(radius);
        this.pi2 = Math.PI * 2;
        this.lineWidth = this.toValue(2);
        this.strokeStyle = color;
    }

    draw = ({ ctx, pointer }) => {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(
            pointer.position.x,
            pointer.position.y,
            this.radius,
            0,
            this.pi2,
            true
        );
        ctx.closePath();
        ctx.stroke();
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Eye
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Eye {
    constructor({ size, position, theta, color, pupilColor }) {
        this.color = color;
        this.pupilColor = pupilColor;
        this.size = size;
        this.setTheta(theta);
        this.position = position;
        this.pupil = new Spring({
            x: 0,
            y: 0,
            elasticity: 0.5,
            damping: 0.3,
            mass: 30,
        });
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');
        this.drawLocal();
    }

    setTheta(theta) {
        this.theta = theta + Math.PI / 2;
    }

    drawLocal() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.save();
        this.ctx.translate(this.size / 2, this.size / 2);
        this.ctx.rotate(this.theta);

        // Create a circular clipping path
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2, true);
        this.ctx.clip();

        // whites
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();

        // pupil
        this.ctx.fillStyle = this.pupilColor;
        this.ctx.beginPath();
        this.ctx.arc(
            this.pupil.x,
            this.pupil.y,
            this.size / 4,
            0,
            Math.PI * 2,
            true
        );
        this.ctx.closePath();
        this.ctx.fill();

        // lid
        this.ctx.translate(-this.size / 2, -this.size / 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.size, this.size / 3);

        this.ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        this.ctx.fillRect(0, 0, this.size, this.size / 3);

        this.ctx.restore();
    }

    draw = ({ ctx }) => {
        this.drawLocal();
        ctx.drawImage(
            this.canvas,
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
    };

    update = ({ theta }) => {
        this.setTheta(theta);
        this.pupil.update({});
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Eyes
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Eyes {
    constructor({ p1, p2, width, size, color, pupilColor }) {
        this.tan = new Tangent({
            p1,
            p2,
            width,
        });

        this.li = new Eye({
            size,
            color,
            pupilColor,
            position: this.tan.t1,
            theta: this.tan.theta,
        });

        this.ri = new Eye({
            size,
            color,
            pupilColor,
            position: this.tan.t2,
            theta: this.tan.theta,
        });
    }

    setVelocity() {
        const [ldx, ldy] = this.tan.t1.delta(this.ct1);
        const [rdx, rdy] = this.tan.t2.delta(this.ct2);
        this.li.pupil.applyForce(-ldx, -ldy);
        this.ri.pupil.applyForce(-rdx, -rdy);
    }

    draw = ({ ctx }) => {
        this.li.draw({ ctx });
        this.ri.draw({ ctx });
    };

    update = context => {
        const { theta } = this.tan;

        this.ct1 = this.tan.t1.clone();
        this.ct2 = this.tan.t2.clone();

        this.tan.update();
        this.setVelocity();

        this.li.update({
            theta,
            ...context,
        });
        this.ri.update({
            theta,
            ...context,
        });
    };
}



//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Mouth
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Mouth {
    constructor({ p1, p2, size, position, lipColor, lipWidth, mouthColor }) {
        this.tan = new Tangent({ p1, p2, size });
        this.lipColor = lipColor;
        this.lipWidth = lipWidth;
        this.mouthColor = mouthColor;
        this.pad = size * 2;
        this.pad2 = size * 4;
        this.size = size + this.pad2;
        this.width = size * 1.5;
        this.center = new Point(this.size / 2, this.size / 2);
        this.position = position;
        this.hs = this.width / 2;
        // offset to account for center translation
        const off = -this.hs;

        this.lip = new Spring({
            x: this.hs + off,
            y: this.width + off,
            elasticity: 0.6,
            damping: 0.1,
            mass: 15,
        });

        this.mouthLeft = new Point(off, this.hs + off);
        this.mouthRight = new Point(this.width + off, this.hs + off);

        // local canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');
        this.drawLocal();
    }

    drawLocal() {
        this.ctx.clearRect(0, 0, this.size, this.size);

        // save and rotate
        this.ctx.save();
        this.ctx.translate(this.size / 2, this.size / 2);
        this.ctx.rotate(this.tan.theta - Math.PI / 2);

        this.ctx.beginPath();
        this.ctx.moveTo(...this.mouthLeft.position);

        // control points
        const cpx1 = (this.mouthRight.x + this.lip.x) / 2;
        const cpy1 = (this.mouthRight.y + this.lip.y) / 2;
        const cpx2 = (this.lip.x + this.mouthRight.x) / 2;
        const cpy2 = (this.lip.y + this.mouthRight.y) / 2;

        // curves
        this.ctx.quadraticCurveTo(
            this.mouthLeft.x,
            this.mouthLeft.y + this.lip.y,
            this.lip.x,
            this.lip.y
        );
        this.ctx.quadraticCurveTo(
            this.mouthRight.x,
            this.mouthRight.y + this.lip.y,
            this.mouthRight.x,
            this.mouthRight.y
        );

        this.ctx.closePath();

        // drawing
        this.ctx.strokeStyle = this.lipColor;
        this.ctx.lineWidth = this.lipWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // mouth
        this.ctx.fillStyle = this.mouthColor;
        this.ctx.fill();
        // teeth
        this.ctx.clip();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(
            this.mouthLeft.x,
            this.mouthLeft.y,
            this.width * 2,
            this.width / 7
        );
        // lips
        // this.ctx.stroke();
        this.ctx.restore();
    }

    setVelocity() {
        const [dx, dy] = this.tan.center.delta(this.ct);
        this.lip.applyForce(0, -dy * 2);
    }

    draw = ({ ctx }) => {
        this.drawLocal();

        ctx.drawImage(
            this.canvas,
            this.tan.center.x - this.size / 2,
            this.tan.center.y - this.size / 2,
            this.size,
            this.size
        );
    };

    update = ({ theta }) => {
        this.ct = this.tan.center.clone();
        this.tan.update();
        this.setVelocity();
        this.lip.update({});
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// TubeDude
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class TubeDude extends Entity {
    constructor({ position, width, height, color, mouthColor, pupilColor }) {
        super();
        this.position = position;
        this.height = height;
        this.width = width;
        this.color = color;
        this.pupilColor = pupilColor;
        this.mouthColor = mouthColor;
        this.resolution = this.toValue(window.innerHeight / 30);
        this.buildBody();
    }

    buildBody() {
        const {
            color,
            width,
            height,
            position,
            resolution,
            mouthColor,
            pupilColor,
        } = this;
        const pointAmt = Math.round(this.height / this.resolution);

        this.body = new Body({
            color,
            width,
            height,
            position,
            resolution,
        });

        this.arms = new Arms({
            p1: this.body.spine[Math.round(pointAmt * 0.6)],
            p2: this.body.spine[Math.round(pointAmt * 0.6) + 1],
            shoulderWidth: width / 1.4,
            length: height * 0.5,
            width: width / 4,
            resolution,
            color,
        });

        this.eyes = new Eyes({
            p1: this.body.spine[Math.round(pointAmt * 0.8)],
            p2: this.body.spine[Math.round(pointAmt * 0.8) + 1],
            color,
            pupilColor,
            size: width / 3.5,
            width: width / 2,
        });

        this.mouth = new Mouth({
            p1: this.body.spine[Math.round(pointAmt * 0.8)],
            p2: this.body.spine[Math.round(pointAmt * 0.8) - 1],
            size: width / 3.5,
            lipColor: '#d16060',
            lipWidth: width / 15,
            mouthColor,
        });
    }

    draw = ({ ctx, bounds }) => {
        this.body.draw({ ctx });
        this.eyes.draw({ ctx });
        this.mouth.draw({ ctx });
        this.arms.draw({ ctx });
    };

    update = context => {
        this.body.update(context);
        this.arms.update(context);
        this.mouth.update(context);
        this.eyes.update();
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Pointer
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Pointer {
    constructor() {
        this.dpr = window.devicePixelRatio || 1;
        this.delta;
        this.lastPosition = null;
        this.position = new Point(null, null);
        this.addListeners();
    }

    delta() {
        return this.position.delta(this.lastPosition);
    }

    addListeners() {
        ['mousemove', 'touchmove'].forEach((event, touch) => {
            window.addEventListener(
                event,
                e => {
                    // move previous point
                    const { x: px, y: py } = this.position;

                    // disable the demo modifier if it's been added
                    if (this.modifier) {
                        this.modifier = null;
                    }

                    if (touch) {
                        e.preventDefault();
                        const x = e.targetTouches[0].clientX * this.dpr;
                        const y = e.targetTouches[0].clientY * this.dpr;
                        if (!this.lastPosition) {
                            this.lastPosition = new Point(x, y);
                        } else {
                            this.lastPosition.moveTo(px, py);
                        }
                        this.position.moveTo(x, y);
                    } else {
                        const x = e.clientX * this.dpr;
                        const y = e.clientY * this.dpr;
                        if (!this.lastPosition) {
                            this.lastPosition = new Point(x, y);
                        } else {
                            this.lastPosition.moveTo(px, py);
                        }
                        this.position.moveTo(x, y);
                    }
                },
                false
            );
        });
    }

    addPointerModifier(modifier) {
        this.modifier = modifier;
    }

    update = ({ tick }) => {
        this.modifier && this.modifier(this, tick);
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Bounds
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Bounds {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        const hw = w / 2;
        const hh = h / 2;
        this.center = new Point(hw, hh);
        this.position = new Point(x, y);
    }

    get params() {
        return [this.x, this.y, this.w, this.h];
    }

    offsetOuter(offset) {
        const [x, y, w, h] = this.params;
        return new Bounds(
            x - offset,
            y - offset,
            w + offset * 2,
            h + offset * 2
        );
    }

    offsetInner(offset) {
        const [x, y, w, h] = this.params;
        return new Bounds(
            x + offset,
            y + offset,
            w - offset * 2,
            h - offset * 2
        );
    }
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Background
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Background extends Entity {
    constructor({ color }) {
        super();
        this.color = color;
    }

    drawBg({ ctx, canvas, bounds }) {
        ctx.fillStyle = this.color;
        ctx.fillRect(...bounds.params);
    }

    draw = context => {
        this.drawBg(context);
    };
}


//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Canvas
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Canvas {
    constructor({ canvas, entities = [], pointer }) {
        // setup a canvas
        this.canvas = canvas;
        this.dpr = window.devicePixelRatio || 1;
        this.ctx = canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);

        // tick counter
        this.tick = 0;

        // entities to be drawn on the canvas
        this.entities = entities;

        // track mouse/touch movement
        this.pointer = pointer || null;

        // setup and run
        this.setCanvasSize();
        this.setupListeners();
        this.render();
    }

    setupListeners() {
        window.addEventListener('resize', this.setCanvasSize);
    }

    setCanvasSize = () => {
        const { innerWidth: w, innerHeight: h } = window;
        const w2 = w * this.dpr;
        const h2 = h * this.dpr;
        this.canvas.width = w2;
        this.canvas.height = h2;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.bounds = new Bounds(0, 0, w2, h2);
    };

    addEntity = newEntity => {
        this.entities = [...this.entities, newEntity];
        return this.entities.length - 1;
    };

    removeEntity(deleteIndex) {
        this.entities = this.entities.filter((el, i) => i !== deleteIndex);
        return this.entities;
    }

    render = () => {
        // Main loop

        // Draw and Update items here.
        this.entities.forEach(({ draw, update }) => {
            draw(this);
            update(this);
        });

        ++this.tick;
        window.requestAnimationFrame(this.render);
    };
}

const bottomCenter = new Point(
    window.innerWidth / 2 * DPR,
    window.innerHeight * DPR
);

const width = Math.max(window.innerWidth, window.innerHeight) / 15 * DPR;

const color = {
    bg: '#F4F3EE',
    dude1: '#E59090',
    dude2: '#E0D67A',
    dude3: '#8385D7',
    pupilColor: '#31343B',
    mouthColor: '#60464E',
    cursor: '#31343B',
};

// Kick off
new Canvas({
    canvas: document.getElementById('canvas'),
    pointer: new Pointer(),
    entities: [
        new Background({ color: color.bg }),
        new TubeDude({
            position: bottomCenter.clone().move(window.innerWidth / 6 * DPR, 0),
            color: color.dude1,
            width,
            height: window.innerHeight * 0.5 * DPR,
            mouthColor: color.mouthColor,
            pupilColor: color.pupilColor,
        }),
        new TubeDude({
            position: bottomCenter
                .clone()
                .move(-window.innerWidth / 6 * DPR, 0),
            color: color.dude2,
            width,
            height: window.innerHeight * 0.55 * DPR,
            mouthColor: color.mouthColor,
            pupilColor: color.pupilColor,
        }),
        new TubeDude({
            position: bottomCenter,
            color: color.dude3,
            width,
            height: window.innerHeight * 0.6 * DPR,
            mouthColor: color.mouthColor,
            pupilColor: color.pupilColor,
        }),
        new Cursor({ color: color.cursor, radius: 10 }),
    ],
});

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


