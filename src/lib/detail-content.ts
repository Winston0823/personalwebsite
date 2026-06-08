import { Project, Skill, PersonalInfo, Artwork, Experience } from "./detail-types";

export { playlist } from "./playlist";

export const personalInfo: PersonalInfo = {
  name: "Winston Gu",
  title: "Video Game Designer",
  university: "University of Southern California",
  major: "Interactive Media and Game Design",
  minor: "Computer Programming",
  bio: [
    "I'm Winston and I am a student at the University of Southern California studying Interactive Media and Game Development.",
    "I'm currently based in Los Angeles for the school year. During this time, I'm busy learning about game design principles, making different genres of games, and experimenting with new AI Tools!",
    "I can't wait to know more people. I'd love to chat about opportunities, projects I've worked on, tennis, or whatever you'd like to chat about!",
  ],
  email: "winstygu@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/winston-gu-b6613b1ab/",
    github: "https://github.com/Winston0823",
  },
  resume: "/resume.pdf",
};

export const projects: Project[] = [
  {
    id: "project-1",
    title: "Dreaming",
    description:
      "A zero-gravity puzzle game about a high-schooler who dozes off in detention and navigates his own dream classroom with recoil.",
    longDescription:
      "Dreaming is a zero-gravity puzzle game set in a high-school classroom. The player must find three keys and reach the door to clear each level by throwing objects and using recoil to navigate the space. The framing: a high-schooler stuck in detention for bad grades dozes off; the dream is what the player experiences, navigating through the classroom to ultimately escape confinement.",
    tags: ["Unity", "Puzzle Game", "Zero-Gravity", "Level Design"],
    category: "level-design",
    domain: "games",
    roles: ["designer"],
    featured: true,
    thumbnail: "/images/dreaming-cover-final.png",
    images: ["/images/dreaming-cover-1.png", "/images/dreaming-cover-final.png"],
    date: "2025-03",
    role: "Level Designer & Narrative Co-Designer",
    heroStyle: "minimal",
    engineIcon: "/icons/unity.svg",
    coverLayout: "behind-hero",
    details: {
      context: "USC IMGD",
    },
    problem:
      "TK — frame the design problem in one sentence. Suggested: How do you teach players a non-obvious movement system (recoil in zero-g) without ever showing a tutorial pop-up?",
    contributions: [
      {
        title: "Zero-gravity level design",
        preview: "level geometry that teaches recoil",
        detail:
          "Classroom geometry that telegraphs recoil paths, key placement that forces three movement loops, and sightlines that hide the door until the puzzle is solved.",
        expandable: true,
      },
      {
        title: "Narrative co-design",
        preview: "a detention escape that only happens in the dream",
        detail:
          "The detention-to-dream framing wraps the gameplay. The classroom turns surreal mid-level, and objects in the dream map to the protagonist's real-world frustrations.",
        expandable: true,
      },
    ],
    outcome:
      "Playtested with 7 people. 4 players cleared the level without help. The most common stumble was being accurate and consistent with the throws to get the player where they wanted to go. The recoil mechanic, while different, was hard to manage.",
    team: [
      "Stefan Sun",
      "Winston (Me), Level Designer & Narrative Co-Designer",
    ],
  },
  {
    id: "project-5",
    title: "Assassin's Weakness is Love",
    description:
      "A rhythm-based Third/First-Person game featuring FPS and runner mechanics, switching perspectives on the beat.",
    longDescription:
      "AWL is a rhythm-based 3rd-person runner and 1st-person runner that uses switching point of views according to different sections of the song. I co-designed and developed the core mechanic and defined the dramatic elements of the game. The game follows an assassin who tries to keep himself away from love due to his profession's need to steer away from emotions. Throughout AWL, you accompany the assassin from his highs to his lows during his love journey.",
    tags: ["Rhythm Game", "FPS", "Runner", "Third-Person", "Game Design"],
    dashboardLine: "Rhythm runner that swaps 3rd↔1st POV on the beat. Unity, 2-person team at USC.",
    category: "game-design",
    domain: "games",
    roles: ["designer", "engineer"],
    featured: true,
    priority: 1,
    thumbnail: "/images/awl/awl-3rd-person-gameplay.png",
    images: ["/images/awl/awl-3rd-person-gameplay.png", "/images/assassin-cover.png"],
    videos: ["https://www.youtube.com/embed/6B80wD-dPss"],
    date: "2025-03",
    role: "Co-Designer & Co-Developer",
    heroStyle: "awl",
    engineIcon: "/icons/unity.svg",
    posterRotation: 6,
    coverLayout: "beside-hero",
    // Cherry-blossom 3rd-person gameplay shot: assassin runs in the
    // left-third of the source image; crop the portrait window over there
    // so the figure stays visible and the right-side hearts fade out.
    coverFocus: "25% center",
    details: {
      devPeriod: "2 weeks",
      teamSize: "2 People",
    },
    problem:
      "How could we take rhythm games to a new level, bringing it out of just clicking on dots on the screen? How can we make the player feel like they're interacting with the rhythm rather than just following along it?",
    narrativeBlocks: [
      {
        title: "We initially ran into conflicts in design decisions",
        body:
          "My partner pitched a first-person rhythm shooter (inspired by Aim Lab) for its precision intensity. I pushed for a third-person auto-runner closer to Super Mario Run for the kinetic flow and approachability. Instead of choosing, we made the song itself the arbiter: verses run third-person so the player builds momentum, choruses cut to first-person where the bassline rewards precise aim. The beat-drop carries the transition because it keeps the swap musically grounded rather than feeling like a UI event. The conflict became the mechanic.",
        media: [
          { src: "/images/awl/3rd Person AWL.png", alt: "Third-person AWL sketch", caption: "3rd-person sketch" },
          { src: "/images/awl/1st Person AWL.png", alt: "First-person AWL sketch", caption: "1st-person sketch" },
        ],
        layout: "media-compare",
      },
      {
        title: "What shipped",
        body:
          "Both POVs made it into the game. The song decides which one you're in. Cherry-blossom verses run in third-person auto-runner mode (slash hearts on the beat), and the choruses cut to a first-person aim-lab where targets pulse with the bassline. The transition is the cue: when the beat drops, the camera collapses inward and the assassin draws his knife. The two sketches above became the two halves of the same level.",
        media: [
          { src: "/images/awl/awl-3rd-person-gameplay.png", alt: "Third-person gameplay, cherry-blossom street, score and accuracy HUD, hearts floating along the path", caption: "3rd-person · slash hearts on the beat" },
          { src: "/images/awl/awl-1st-person-gameplay.png", alt: "First-person gameplay, neon night street, glowing heart target with throwing knife in foreground", caption: "1st-person · throw on the beat" },
        ],
        layout: "media-compare",
      },
    ],
    contributions: [
      {
        title: "Core mechanic: POV switch on the beat",
        preview: "the camera swaps when the bass drops",
        detail:
          "Designed and tuned the beat-locked perspective transition. Mapped the swap to musical downbeats so it reads as part of the song, not a UI event. Added a forgiveness window so a slightly mistimed swap still feels rhythmic.",
        expandable: true,
      },
      {
        title: "Story & narrative arc",
        preview: "an assassin who falls in love despite himself",
        detail:
          "Wrote the love-story framing: an assassin whose profession requires emotional distance, drawn into feelings he can't suppress. Mapped his emotional arc to the level beats so the highs and lows of the song mirror his.",
        expandable: true,
      },
      {
        title: "Beat-mapping a level",
        preview: "tracks, spawns, and hit windows tuned to the song",
        detail:
          "Built the pipeline for choosing tracks and authoring enemy spawns and obstacle placement against musical events. Tuned hit windows so combat reads as rhythmic rather than reactive.",
        expandable: true,
      },
    ],
    outcome:
      "Shipped a playable build in two weeks for a class jam. Playtested with 7 people: all 7 cleared the level on the first try, and 5 wanted to play again to chase a higher score. Tuning the third-person to first-person transition window was the longest iteration loop. Next time I'd front-load the swap-feel iteration before locking in any level content.",
    team: [
      "Stefan, Developer and Designer",
      "Winston (Me), Developer and Designer",
    ],
    links: [
      { label: "Trailer", url: "https://youtu.be/6B80wD-dPss" },
    ],
  },
  {
    id: "project-6",
    title: "The Sublime",
    description:
      "An open world exploration game featuring a gliding mechanic and intense visuals.",
    longDescription:
      "The Sublime is an open world exploration game featuring a gliding mechanic and intense visuals. I co-developed the game, drew UI elements, and co-designed the core mechanic along with the flow of the game.",
    tags: ["Open World", "Exploration", "Gliding Mechanic", "Game Design", "UI Design"],
    dashboardLine: "Open-world glider in Unreal Engine — landscape stays the subject.",
    category: "game-design",
    domain: "games",
    roles: ["designer", "engineer", "art-ui"],
    featured: true,
    priority: 2,
    thumbnail: "/images/sublime.png",
    heroStyle: "sublime",
    engineIcon: "/icons/unreal.svg",
    coverLayout: "beside-hero",
    coverAspect: "4 / 5",
    details: {
      context: "USC IMGD",
    },
    problem:
      "How do you make a vast open world feel awe-inspiring without overwhelming the player with mechanics?",
    contributions: [
      {
        title: "Glide & traversal feel",
        preview: "tuned the glide to feel earned, never weightless",
        detail:
          "Tuned the glide curve, terminal velocity, and recovery cadence so flight reads as effortful but never punishing.",
        expandable: true,
      },
      {
        title: "UI direction",
        preview: "diegetic HUD, minimal chrome, landscape stays the subject",
        detail:
          "Drew the diegetic HUD elements and onboarding prompts; kept the chrome minimal so the landscape stays the subject.",
        expandable: true,
      },
      {
        title: "Pacing of awe moments",
        preview: "vista reveals at deliberate intervals",
        detail:
          "Co-authored the route through the world so vista reveals land at consistent intervals, not all at once.",
        expandable: true,
      },
    ],
    outcome:
      "Playtests showed first-time players completed a full loop without needing tutorial text. Next time I'd push harder on environmental storytelling between vistas.",
    team: ["Co-developed with USC IMGD team"],
    images: ["/images/sublime.png"],
    videos: ["https://www.youtube.com/embed/2y-O1_GfOMk"],
    date: "2025-06",
    role: "Co-Developer, UI Artist & Co-Designer",
    links: [
      { label: "Trailer", url: "https://youtu.be/2y-O1_GfOMk" },
    ],
  },
  {
    id: "project-7",
    title: "The Unrealtor",
    description:
      "A surreal couch-co-op puzzle adventure where two roommates tour an impossible house that warps around them.",
    longDescription:
      "The Unrealtor is a two-player perspective-puzzle game where Maya and Noah solve split-screen visual riddles that transform the house around them. As a technical artist, level designer, and set dresser, I owned the layer between in-engine art and animation: making characters move convincingly through architecture that doesn't obey physics, wrapping all of the existing art assets around the designer's needs. The result is a tour through impossible rooms where every step still feels grounded.",
    tags: [
      "Puzzle",
      "Co-op",
      "First-Person",
      "Surreal",
      "Technical Art",
      "Level Design",
      "Set Dressing",
      "Unity",
    ],
    dashboardLine: "Couch-coop puzzle, shipping May 2026 via USC Games. IK footsteps + level design.",
    category: "game-design",
    domain: "games",
    roles: ["designer", "engineer", "art-ui"],
    featured: true,
    priority: 3,
    thumbnail: "/images/unrealtor/cover.jpg",
    images: ["/images/unrealtor/cover.jpg"],
    date: "2026-05",
    role: "Technical Artist, Level Designer, Set Dresser",
    heroStyle: "minimal",
    engineIcon: "/icons/unity.svg",
    posterRotation: -6,
    details: {
      devPeriod: "TK — start month/year – present",
      teamSize: "TK — e.g. Team of 12 (USC Games capstone)",
      context: "USC Games · Homestyle Interactive",
    },
    problem:
      "TK — one sentence framing the design problem. Suggested: How do you keep characters feeling physically present in a house whose floors, stairs, and walls warp mid-step?",
    // Narrative blocks intentionally omitted — IK Footsteps lives inside
    // the Contributions list as a click-to-expand item in the minimal layout.
    contributions: [
      {
        title: "IK Footsteps",
        preview: "all steps were in the right direction",
        detail:
          "Foot-raycast solver, foot-to-stair calculations, blend compensation for warped meshes, edge cases (descending corner stairs, slanted-ceiling rooms).",
        expandable: true,
      },
      {
        title: "Animation Calibration",
        preview: "made use with animations and tuned them to fit",
        detail:
          "Integrated animator-authored cycles into the gameplay state machine. Used Unity's built-in animation system, built blend trees, tuned and edited mocap animations.",
        expandable: true,
      },
      {
        title: "Level design and set dressing",
        preview: "Fixed scenes' visual compositions and aligned with design bible",
        detail:
          "Set dressed main living room, child's playroom, and studio scenes. Rebuilt scenes to align with design and dramatic goals. Focused on rendering performance, what players see, and information architecture for set-dressing decisions.",
        expandable: true,
      },
    ],
    outcome:
      "Released through USC Games in May 2026. Go check it out!",
    team: [
      "USC Unrealtor AGP Team",
    ],
    links: [
      { label: "Steam page", url: "https://store.steampowered.com/app/4420050/The_Unrealtor/" },
    ],
  },
  {
    id: "project-usc-racing",
    title: "USC Formula Electric",
    description:
      "The official website for USC's Formula Electric racing team — a black-and-gold design system, a real-time 3D car hero, and a templated page for every engineering division.",
    longDescription:
      "USC Formula Electric is a student-run team that designs and builds an electric race car from the ground up. The site is its front door: it has to recruit engineers, court sponsors, and present a 50+ person student team as a serious motorsport brand. I led the design and build — a token-driven design system, a real-time 3D hero, and a templated system that gives each of the team's ten specialized divisions its own editorial page.",
    tags: ["Next.js", "Tailwind v4", "React Three Fiber", "Framer Motion", "Design System"],
    dashboardLine:
      "Official site for USC's Formula Electric team — design system, real-time 3D car hero, a page per division. Next.js + R3F.",
    category: "other",
    domain: "ui-ux",
    roles: [],
    featured: true,
    priority: 0,
    thumbnail: "/images/usc-racing/usc-racing-hero.png",
    images: [
      "/images/usc-racing/usc-racing-hero.png",
      "/images/usc-racing/usc-racing-aero.png",
      "/images/usc-racing/usc-racing-sponsorship.png",
    ],
    // TODO: confirm the real build window — placeholder for now.
    date: "2024 – Present",
    role: "Lead Developer & UI/UX Architect",
    heroStyle: "usc",
    details: {
      teamSize: "50+ members",
      context: "USC Formula Electric",
      tools: [
        "Next.js (App Router)",
        "React",
        "Tailwind CSS v4",
        "React Three Fiber / Three.js",
        "Framer Motion",
        "Lenis",
      ],
      statement:
        "A student team should look every bit as engineered as the car it builds. The whole site runs on one tight visual vocabulary — black, USC gold, an ambient cardinal glow — so every page feels like part of the same machine.",
    },
    // Framed as the goal — what the design had to achieve.
    problem:
      "A student racing team has to recruit engineers, win over sponsors, and look as serious as the machines it builds — all at once. The site had to read as a professional motorsport brand while staying a recruiting-first, student-run front door.",
    contributions: [
      {
        title: "A design system, not a coat of paint",
        detail:
          "A token-driven black-and-gold system in Tailwind v4 — USC gold (#E3B53D) and an ambient cardinal glow over true black — with a layered type stack: Ethnocentric for display, Rajdhani for body, Inter Tight for headlines, JetBrains Mono for data. Every page is assembled from the same vocabulary.",
        image: "/images/usc-racing/usc-racing-sponsorship.png",
      },
      {
        title: "Every division gets its own voice",
        detail:
          "Ten specialized divisions — aerodynamics, powertrain, accumulator, and the rest — each get a templated page: an oversized editorial headline, pinned 'polaroid' build photos with handwritten captions, and a prev/next division counter. One template, ten personalities.",
        image: "/images/usc-racing/usc-racing-aero.png",
      },
      {
        title: "A 3D car hero, rendered live in the browser",
        detail:
          "The landing hero renders the car with React Three Fiber and drei, lit with a warm ambient glow over a black field. No baked video — real-time WebGL that reacts as the page loads.",
      },
      {
        title: "Motion that respects the scroll",
        detail:
          "Lenis drives smooth scrolling from a single provider that also centralizes route-change scroll-reset; Framer Motion handles section reveals and scroll choreography. A feature-flag module keeps the growing site safe to ship.",
      },
    ],
    outcome:
      "Serves as the team's official front door — recruiting engineers, courting sponsors, and presenting 50+ members across ten divisions as a single, professional brand.",
    cta: {
      heading: "See it live",
      sublabel:
        "The team site in production — explore the divisions, the sponsorship pitch, and the real-time 3D hero.",
      label: "Explore the live site",
      // TODO: replace with the deployed URL before publishing.
      url: "#",
    },
  },
];

export const experience: Experience[] = [
  {
    id: "exp-project-disciple",
    company: "Project Disciple",
    location: "USC Games LiveOps Department",
    role: "UI Designer",
    year: "Jan–May 2026",
    start: "January 2026",
    end: "May 2026",
    bullets: [
      "Designing player-centric visual interfaces for seasonal live events using Figma and Photoshop, producing assets aligned with brand guidelines across multiple in-game formats, driving engagement through iterative design.",
      "Collaborating with product and engineering teams to iterate on UI designs, ensuring visual consistency and usability across in-game menus and event overlays.",
    ],
  },
  {
    id: "exp-liveops",
    company: "LiveOps",
    location: "San Francisco, CA",
    role: "Brand Designer",
    year: "Dec 2025–Mar 2026",
    start: "December 2025",
    end: "March 2026",
    bullets: [
      "Designed and delivered logo and icon suite across web and marketing specs; managed SVG asset pipeline using Photoshop Generative Fill and Illustrator with AI-accelerated iteration.",
      "Partnered with founders to define and establish cohesive visual identity across digital touchpoints.",
    ],
  },
  {
    id: "exp-unrealtor",
    company: "The Unrealtor",
    location: "USC Advanced Games Project",
    role: "Technical Artist, Level Designer & Set Dresser",
    year: "Oct 2025–May 2026",
    start: "October 2025",
    end: "May 2026",
    bullets: [
      "Modeled and textured 3D puzzle assets using TripoAI and Meshy; optimized geometry and UVs in Maya for real-time performance.",
      "Produced 2D environment concept art and character visual explorations to guide level design, puzzle creation, and art direction using Photoshop.",
    ],
  },
  {
    id: "exp-formula-e",
    company: "Formula E Racing Club",
    location: "USC",
    role: "Business Team Member",
    year: "2025–Present",
    start: "September 2025",
    end: "Present",
    bullets: [
      "Led end-to-end website development using HTML, CSS, and JavaScript; implemented scroll-driven animations and interactive elements for the club's public-facing site, owning the full pipeline from Figma wireframes to production-ready deployment.",
      "Managed asset pipeline from Adobe CC to production, maintaining visual consistency across web and marketing formats.",
      "Produced on-brand social media campaigns and marketing materials using Google Pomelli (AI-powered brand content generation), Photoshop, and Premiere Pro to drive online growth.",
    ],
  },
  {
    id: "exp-lilith",
    company: "Lilith Games",
    location: "Shanghai, China",
    role: "Farlight 84 Hero Development Intern",
    year: "2024",
    start: "March 2024",
    end: "April 2024",
    bullets: [
      "Researched aesthetic preferences and player behavior across 4+ hero archetypes in rival FPS titles, presenting findings to design leadership to guide future character direction.",
      "Delivered seasonal live-ops content strategy recommendations across multiple hero themes, collaborating with a cross-functional international team to align visual and gameplay goals — directly relevant to Arknights-style live-ops pipelines.",
      "Contributed to hero concept discussions focused on ability readability, visual drama, and thematic cohesion for a global player base.",
    ],
  },
];

export const skills: Skill[] = [
  { name: "Level Design", category: "design" },
  { name: "Game Systems Design", category: "design" },
  { name: "Combat Design", category: "design" },
  { name: "UI/UX Design", category: "design" },
  { name: "Game Balancing", category: "design" },
  { name: "Playtesting and Iteration", category: "design" },
  { name: "C#", category: "technical" },
  { name: "C++", category: "technical" },
  { name: "HTML/CSS", category: "technical" },
  { name: "Blueprint Visual Scripting", category: "technical" },
  { name: "Version Control (Git)", category: "technical" },
  { name: "Unreal Engine 5", category: "tools" },
  { name: "Unity", category: "tools" },
  { name: "Photoshop", category: "tools" },
  { name: "Premiere Pro", category: "tools" },
  { name: "Maya", category: "tools" },
  { name: "Procreate", category: "tools" },
  { name: "WordPress", category: "tools" },
  { name: "Blender", category: "tools" },
  { name: "Figma", category: "tools" },
  { name: "Digital Art", category: "art" },
  { name: "2D Concepting", category: "art" },
  { name: "Oil Painting", category: "art" },
  { name: "English", category: "languages" },
  { name: "Chinese", category: "languages" },
];

export const artworks: Artwork[] = [
  {
    id: "art-formula-sae",
    title: "Formula SAE Sticker Design",
    description: "",
    date: "2024-12",
    medium: "Vector Illustration",
    tools: [],
    category: "illustration",
    image: "/images/artworks/formula-sae-sticker.png",
    width: 4096,
    height: 1714,
  },
  {
    id: "art-fracture",
    title: "Fracture",
    description: "",
    date: "2023-12",
    medium: "Digital Illustration",
    tools: [],
    category: "illustration",
    image: "/images/artworks/fracture.jpg",
    width: 1071,
    height: 1428,
  },
  {
    id: "art-bewildered",
    title: "Bewildered",
    description: "",
    date: "2023-12",
    medium: "Digital Illustration",
    tools: [],
    category: "illustration",
    image: "/images/artworks/bewildered.jpg",
    width: 1596,
    height: 2067,
  },
  {
    id: "art-jump",
    title: "Jump",
    description: "",
    date: "2023-12",
    medium: "Digital Illustration",
    tools: [],
    category: "illustration",
    image: "/images/artworks/jump.jpg",
    width: 2480,
    height: 3508,
  },
  {
    id: "art-male-figure",
    title: "Male Figure Drawing",
    description: "",
    date: "2025-02",
    medium: "Graphite on Paper",
    tools: [],
    category: "illustration",
    image: "/images/artworks/male-figure-drawing.jpg",
    width: 1280,
    height: 1707,
  },
  {
    id: "art-noise-of-night",
    title: "Noise of Night",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/noise-of-night.jpg",
    width: 1279,
    height: 1606,
  },
  {
    id: "art-peace-of-dawn",
    title: "Peace of Dawn",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/peace-of-dawn.jpg",
    width: 1594,
    height: 1279,
  },
  {
    id: "art-porsche-918",
    title: "Porsche 918 Sketch",
    description: "",
    date: "2025-02",
    medium: "Sketch",
    tools: [],
    category: "illustration",
    image: "/images/artworks/porsche-918-sketch.jpg",
    width: 2880,
    height: 2225,
  },
  {
    id: "art-sonder",
    title: "Sonder",
    description: "",
    date: "2025-02",
    medium: "Digital Illustration",
    tools: [],
    category: "illustration",
    image: "/images/artworks/sonder.jpg",
    width: 1071,
    height: 1345,
  },
  {
    id: "art-streets-i",
    title: "Streets I",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/streets-i.jpg",
    width: 2225,
    height: 2880,
  },
  {
    id: "art-streets-ii",
    title: "Streets II",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/streets-ii.jpg",
    width: 2225,
    height: 2880,
  },
  {
    id: "art-streets-iii",
    title: "Streets III",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/streets-iii.jpg",
    width: 2225,
    height: 2880,
  },
  {
    id: "art-streets-iv",
    title: "Streets IV",
    description: "",
    date: "2025-02",
    medium: "Digital Painting",
    tools: [],
    category: "illustration",
    image: "/images/artworks/streets-iv.jpg",
    width: 2225,
    height: 2880,
  },
];

export const skillCategories: Record<string, string> = {
  design: "Design",
  technical: "Technical",
  tools: "Tools",
  art: "Art",
  languages: "Languages",
};
