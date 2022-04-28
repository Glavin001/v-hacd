import fs from "fs";

const Ammo = await (await import("./builds/ammo.js")).default();

const h = new Ammo.AmmoHelpers();

const a = h.CreateVHACD_ASYNC();

const contents = fs.readFileSync("./cube.obj", "utf8").toString();

const rows = contents
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(" "));
const vertices = rows
  .filter((row) => row[0] === "v")
  .map((row) => row.slice(1).map(parseFloat));
const faces = rows
  .filter((row) => row[0] === "f")
  .map((row) => row.slice(1))
  .map((row) => row.map((cell) => parseInt(cell.split("/")[0])));

// console.log(contents);
console.log(vertices.length, faces.length);

// const res = a.Compute(vertices, vertices.length, faces, faces.length)

const points = Ammo._malloc(vertexCount * 3 * 8 + 3);
const triangles = Ammo._malloc(triCount * 3 * 4);

let pptr = points / 8,
  tptr = triangles / 4;

for (let i = 0; i < vertices.length; i++) {
  const components = vertices[i];
  matrix.fromArray(matrices[i]);
  for (let j = 0; j < components.length; j += 3) {
    vector
      .set(components[j + 0], components[j + 1], components[j + 2])
      .applyMatrix4(matrix)
      .sub(center);
    Ammo.HEAPF64[pptr + 0] = vector.x;
    Ammo.HEAPF64[pptr + 1] = vector.y;
    Ammo.HEAPF64[pptr + 2] = vector.z;
    pptr += 3;
  }
  if (indexes[i]) {
    const indices = indexes[i];
    for (let j = 0; j < indices.length; j++) {
      Ammo.HEAP32[tptr] = indices[j];
      tptr++;
    }
  } else {
    for (let j = 0; j < components.length / 3; j++) {
      Ammo.HEAP32[tptr] = j;
      tptr++;
    }
  }
}

const res = a.Compute(points, vertices.length, triangles, faces.length);
console.log(res);

setInterval(() => {
  console.log("ready", a.IsReady());
  process.exit(0);
}, 500);
