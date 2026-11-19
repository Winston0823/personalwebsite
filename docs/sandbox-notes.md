# Sandbox workspace and private notes

`/sandbox` is the workspace. The left project drawer selects a prototype (currently TTOA); the right drawer contains its live style controls. Both collapse to edge tabs without remounting the running app. `/sandbox/ttoa` remains a direct link to the same workspace. The Prototype link opens the configured preview URL rather than GitHub.

## Guest privacy

The server creates a random 256-bit guest cookie, HttpOnly and SameSite=Lax, valid for a year. Only a SHA-256 hash is stored alongside notes. GET filters by that identity on the server; another guest never receives the note, text, or author hash. Clearing cookies or using another browser creates a new identity, so guests lose access to their old notes. Guests should keep their browser profile private.

Owner access uses `SANDBOX_OWNER_KEY`, a private server environment variable with at least 32 characters. A local random key has been generated in ignored `.env.local`. Click the small key control under the sticky pad and enter that key to view all notes. Owner sessions are HttpOnly, SameSite=Strict, signed with the secret, and expire in eight hours. Rotate the key to revoke all owner sessions. Do not prefix it with `NEXT_PUBLIC_` or commit it.

Both the author and owner can move or delete a note. Position updates use the same server-side ownership checks as deletion and reject invalid coordinates. Writes check same-origin requests. Note length is limited to 1,000 characters, request bodies to 16 KB, and each browser identity to 20 posts per hour. The form includes a hidden spam trap. Guest rate limits discourage casual spam; production can add an edge rate limiter or challenge if abuse occurs.

Notes include the active device and style settings for later review. These are inert JSON, never executed as CSS or code. Note text renders as escaped React text.

## Storage and deployment

Local notes persist in ignored `.data/sandbox/notes.json`. Atomic replacement and a process queue serialize writes on one Node server. `SANDBOX_NOTES_DIR` can point to private persistent storage when self-hosting a single Node instance. Never place it in `public` or a directory served by the web server. Back up the directory separately.

The file store is **not suitable for multiple application instances or ephemeral serverless filesystems**. On Vercel, notes fail closed unless a storage directory is configured. Do not configure a temporary directory as a workaround: provision durable database storage and replace the `noteStore` implementation before enabling notes there. The UI retains the draft and shows posting failures rather than claiming that a note was saved. No public deployment has been changed.

The owner key must be configured separately in production. Restart/rebuild after changing environment variables. Browser cookies use Secure on HTTPS.

## Interaction

Drag the bottom of the pad upward: the fold follows the exact grab point and pull angle, then lifts off as the paper clears the pad. The crease reflects the lifted corner toward the cursor; canceling a short pull eases the paper back to its square shape. Release in the playground to settle a square note and write a comment. Post contracts it into a small sticky; selecting the sticky reopens the comment. Drag its top grip to reposition either an open or contracted note. Positions are saved on drop; failed saves restore the previous position. Focus the grip and use arrow keys to nudge, with Shift for larger steps. Clicking the pad also creates a note for keyboard and touch accessibility. Canceled/short drags return the paper to the pad. Reduced motion removes spring transitions.

Run `node --experimental-strip-types --test scripts/sandbox-notes.test.mjs` for identity filtering, owner session expiry/tampering, and payload validation. Verify API guest isolation and owner access against the running server before deployment.

Draft notes also have a header grip and arrow-key movement. Moving a draft preserves its text and remains local until Post saves the final position. Drawer outlines and tabs reuse the homepage’s five-drawing line boil and reduced-motion support.

Directional fold geometry is covered by `scripts/sticky-paper.test.mjs`. The API integration test also checks that another guest cannot move a note and that a valid move survives a fresh read.
