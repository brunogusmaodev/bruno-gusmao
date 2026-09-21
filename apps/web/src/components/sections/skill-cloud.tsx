import Image from "next/image";

const skills = [
  { label: "JavaScript", image: "icons/javascript.svg" },
  { label: "TypeScript", image: "icons/typescript.svg" },
  { label: "React", image: "icons/react.svg" },
  { label: "Node.js", image: "icons/nodejs.svg" },
  { label: "Next.js", image: "icons/nextjs.svg" },
  { label: "PostgreSQL", image: "icons/postgresql.svg" },
  { label: "Docker", image: "icons/docker.svg" },
  { label: "Angular", image: "icons/angular.svg" },
  { label: "Java", image: "icons/java.svg" },
  { label: "NestJS", image: "icons/nestjs.svg" },
  { label: "React Native", image: "icons/react-2.svg" },
];

export function SkillCloud() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {skills.map((skill) => (
        <div
          key={skill.label}
          className="flex items-center gap-2.5 rounded-md border border-border bg-card px-4 py-2.5 text-sm transition-colors hover:border-brand/40"
        >
          <Image
            src={skill.image}
            alt={skill.label}
            width={20}
            height={20}
            className="size-5 object-contain"
          />
          <span className="font-medium">{skill.label}</span>
        </div>
      ))}
    </div>
  );
}
