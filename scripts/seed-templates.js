const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { randomUUID } = require("crypto");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const text = fs.readFileSync(envPath, "utf8");
  const values = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }

  return values;
}

const IMAGES = [
  {
    file: "library-01.jpg",
    title: "Warm sunrise",
    alt: "Soft golden light over a quiet landscape",
  },
  {
    file: "library-02.jpg",
    title: "City dusk",
    alt: "City skyline at dusk with warm tones",
  },
  {
    file: "library-03.jpg",
    title: "Ocean calm",
    alt: "Calm ocean water with soft blue hues",
  },
  {
    file: "library-04.jpg",
    title: "Forest path",
    alt: "Sunlit path through green trees",
  },
  {
    file: "library-05.jpg",
    title: "Desert dunes",
    alt: "Sand dunes under warm sunlight",
  },
  {
    file: "library-06.jpg",
    title: "Mountain mist",
    alt: "Misty mountains in soft light",
  },
  {
    file: "library-07.jpg",
    title: "Coffee table",
    alt: "Minimal coffee and notebook scene",
  },
  {
    file: "library-08.jpg",
    title: "Abstract texture",
    alt: "Soft abstract textured background",
  },
];

const TEMPLATES = [
  {
    slug: "classic",
    name: "Classic",
    layoutKey: "classic",
    description: "White card, black type, orange rule, green tag",
    sortOrder: 1,
  },
  {
    slug: "gradient",
    name: "Gradient",
    layoutKey: "gradient",
    description: "Green-to-yellow wash behind the quote",
    sortOrder: 2,
  },
  {
    slug: "poster",
    name: "Poster",
    layoutKey: "poster",
    description: "Black field, white type, orange highlight",
    sortOrder: 3,
  },
  {
    slug: "overlay",
    name: "Overlay",
    layoutKey: "overlay",
    description: "Full-bleed photo with a dark scrim",
    sortOrder: 4,
  },
  {
    slug: "split",
    name: "Split",
    layoutKey: "split",
    description: "Photo beside the quote copy",
    sortOrder: 5,
  },
  {
    slug: "editorial",
    name: "Editorial",
    layoutKey: "editorial",
    description: "Large quote, green kicker, thin orange frame",
    sortOrder: 6,
  },
];

async function main() {
  const env = loadEnv();
  const client = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  await client.connect();

  const imageIds = [];

  for (const image of IMAGES) {
    const url = `/library/${image.file}`;
    const existing = await client.query(
      `SELECT id FROM "library_image" WHERE url = $1 LIMIT 1`,
      [url]
    );

    if (existing.rows[0]) {
      await client.query(
        `UPDATE "library_image" SET title = $2, alt = $3 WHERE id = $1`,
        [existing.rows[0].id, image.title, image.alt]
      );
      imageIds.push(existing.rows[0].id);
    } else {
      const id = randomUUID();
      await client.query(
        `
        INSERT INTO "library_image" ("id", "title", "url", "alt")
        VALUES ($1, $2, $3, $4)
        `,
        [id, image.title, url, image.alt]
      );
      imageIds.push(id);
    }
  }

  for (let i = 0; i < TEMPLATES.length; i += 1) {
    const tpl = TEMPLATES[i];
    const defaultImageId = imageIds[i % imageIds.length];
    const existing = await client.query(
      `SELECT id FROM "template" WHERE slug = $1 LIMIT 1`,
      [tpl.slug]
    );

    if (existing.rows[0]) {
      await client.query(
        `
        UPDATE "template"
        SET name = $2,
            layout_key = $3,
            description = $4,
            active = true,
            sort_order = $5,
            default_image_id = $6,
            updated_at = now()
        WHERE slug = $1
        `,
        [
          tpl.slug,
          tpl.name,
          tpl.layoutKey,
          tpl.description,
          tpl.sortOrder,
          defaultImageId,
        ]
      );
    } else {
      await client.query(
        `
        INSERT INTO "template"
          ("id", "name", "slug", "layout_key", "description", "active", "sort_order", "default_image_id")
        VALUES ($1, $2, $3, $4, $5, true, $6, $7)
        `,
        [
          randomUUID(),
          tpl.name,
          tpl.slug,
          tpl.layoutKey,
          tpl.description,
          tpl.sortOrder,
          defaultImageId,
        ]
      );
    }
  }

  const counts = await client.query(`
    SELECT
      (SELECT count(*)::int FROM library_image) AS images,
      (SELECT count(*)::int FROM template) AS templates
  `);

  console.log(
    `seeded images=${counts.rows[0].images} templates=${counts.rows[0].templates}`
  );

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
