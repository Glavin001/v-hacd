import { useEffect, useState } from "react";

// import AmmoModule from "../../builds/ammo.js";
// import AmmoModule from "../../builds/ammo.wasm.js";
// import * as AmmoModule from "../public/vhacd/ammo.wasm.js";
// import AmmoModule from "../public/vhacd/ammo.js";
// console.log("Library", AmmoModule);

export default function VHACD() {
  const [AmmoModulePromise] = useState(async () => {
    return (await import("../public/vhacd/ammo.wasm.js")).default;
  });
  
  useEffect(() => {
    async function init() {
      // const AmmoModule = (await import("../public/vhacd/ammo.js")).default;
      // const AmmoModule = (await import("../public/vhacd/ammo.wasm.js")).default;
      const AmmoModule = await AmmoModulePromise;
      console.log("AmmoModule", AmmoModule);
      const Ammo = await AmmoModule({
        mainScriptUrlOrBlob: "/vhacd/ammo.js",
        locateFile: function(s) {
          console.log('locateFile', s);
          return 'vhacd/' + s;
        },
      });

      const h = new Ammo.AmmoHelpers();

      console.log("Library", Ammo, h);

      const vhacd = h.CreateVHACD_ASYNC();

      console.log("vhacd", vhacd);

      // const contents = fs.readFileSync("../cube.obj", "utf8").toString();

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
        .map((row) => row.map((cell) => parseInt(cell.split("/")[0], 10) - 1));

      // console.log(contents);
      console.log(vertices.length, faces.length);

      const parameters = new Ammo.Parameters();
      const logging = new Ammo.Logging();
      parameters.m_callback = logging;
      // parameters.m_logger = logging;
      // const res = a.Compute(vertices, vertices.length, faces, faces.length, parameters)

      const points = Ammo._malloc(vertices.length * 3 * 8 + 3);
      const triangles = Ammo._malloc(faces.length * 3 * 4);

      let pptr = points / 8,
        tptr = triangles / 4;

      const indexes = faces;
      for (let i = 0; i < vertices.length; i++) {
        const components = vertices[i];
        // matrix.fromArray(matrices[i]);
        for (let j = 0; j < components.length; j += 3) {
          //   vector
          //     .set(components[j + 0], components[j + 1], components[j + 2])
          //     .applyMatrix4(matrix)
          //     .sub(center);
          const vector = {
            x: components[0],
            y: components[1],
            z: components[2],
          };
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

      const res = vhacd.Compute(
        points,
        vertices.length,
        triangles,
        faces.length,
        parameters
      );

      console.log(res);
      console.log("ready", vhacd.IsReady());

      function OnReady() {
        const nHulls = vhacd.GetNConvexHulls();
        console.log("Found", nHulls, "hulls");
        const allHulls = [];

        const ch = new Ammo.ConvexHull();
        for (let i = 0; i < nHulls; i++) {
          vhacd.GetConvexHull(i, ch);
          const nPoints = ch.get_m_nPoints();
          // const hullPoints = ch.get_m_points();
          const hull = [];

          for (let pi = 0; pi < nPoints; pi++) {
            const px = ch.get_m_points(pi * 3 + 0);
            const py = ch.get_m_points(pi * 3 + 1);
            const pz = ch.get_m_points(pi * 3 + 2);
            // hull.addPoint(btVertex, pi === nPoints - 1);
            const vertex = [px, py, pz];
            hull.push(vertex);
          }
          // console.log('Hull', i, hull);
          allHulls.push(hull);
          // shapes.push(finishCollisionShape(hull, options, scale));
        }
        Ammo.destroy(ch);
        Ammo.destroy(vhacd);

        console.log("All hulls", allHulls);
        console.log(JSON.stringify(allHulls));
      }

      const intervalId = setInterval(() => {
        console.log("ready", vhacd.IsReady());
        // process.exit(0);
        if (vhacd.IsReady()) {
          clearInterval(intervalId);
          OnReady();
        }
      }, 500);
    }
    init();
  });

  return <div></div>;
}

var contents = `
o Cube
v -124.64166259765628 140 99.35833740234372
v -124.64166259765628 140 -2.842170943040401e-14
v -124.64166259765628 50.180633544921875 99.35833740234372
v -124.64166259765628 50.180633544921875 -2.842170943040401e-14
v -224.00000000000003 140 -2.842170943040401e-14
v -224.00000000000003 140 99.35833740234372
v -224.00000000000003 50.180633544921875 -2.842170943040401e-14
v -224.00000000000003 50.180633544921875 99.35833740234372
v -224.00000000000003 140 -2.842170943040401e-14
v -124.64166259765628 140 -2.842170943040401e-14
v -224.00000000000003 140 99.35833740234372
v -124.64166259765628 140 99.35833740234372
v -224.00000000000003 50.180633544921875 99.35833740234372
v -124.64166259765628 50.180633544921875 99.35833740234372
v -224.00000000000003 50.180633544921875 -2.842170943040401e-14
v -124.64166259765628 50.180633544921875 -2.842170943040401e-14
v -224.00000000000003 140 99.35833740234372
v -124.64166259765628 140 99.35833740234372
v -224.00000000000003 50.180633544921875 99.35833740234372
v -124.64166259765628 50.180633544921875 99.35833740234372
v -124.64166259765628 140 -2.842170943040401e-14
v -224.00000000000003 140 -2.842170943040401e-14
v -124.64166259765628 50.180633544921875 -2.842170943040401e-14
v -224.00000000000003 50.180633544921875 -2.842170943040401e-14
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vt 0 1
vt 1 1
vt 0 0
vt 1 0
vn 1 0 0
vn 1 0 0
vn 1 0 0
vn 1 0 0
vn -1 0 0
vn -1 0 0
vn -1 0 0
vn -1 0 0
vn 0 1 0
vn 0 1 0
vn 0 1 0
vn 0 1 0
vn 0 -1 0
vn 0 -1 0
vn 0 -1 0
vn 0 -1 0
vn 0 0 1
vn 0 0 1
vn 0 0 1
vn 0 0 1
vn 0 0 -1
vn 0 0 -1
vn 0 0 -1
vn 0 0 -1
f 1/1/1 3/3/3 2/2/2
f 3/3/3 4/4/4 2/2/2
f 5/5/5 7/7/7 6/6/6
f 7/7/7 8/8/8 6/6/6
f 9/9/9 11/11/11 10/10/10
f 11/11/11 12/12/12 10/10/10
f 13/13/13 15/15/15 14/14/14
f 15/15/15 16/16/16 14/14/14
f 17/17/17 19/19/19 18/18/18
f 19/19/19 20/20/20 18/18/18
f 21/21/21 23/23/23 22/22/22
f 23/23/23 24/24/24 22/22/22
`;
