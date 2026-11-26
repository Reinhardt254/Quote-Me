function s3RemotePattern() {
  const publicUrl = process.env.S3_PUBLIC_URL?.trim();
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const remotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
];

const s3Pattern = s3RemotePattern();
if (s3Pattern) {
  remotePatterns.push(s3Pattern);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg", "drizzle-orm", "@aws-sdk/client-s3"],
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;
