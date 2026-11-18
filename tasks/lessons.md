# Lessons

- When a user identifies a desired repository version by a visual feature, search for that feature and verify it in the running page before selecting a branch by recency. Animated elements can pause when scrolled out of view, so inspect them while visible.
- When a user changes direction during a visual experiment, restore the original asset and test the simpler styling change directly. Keep the preview easy to compare with the previous version.
- When one mark appears in a hero and a navigation transition, use the same source asset for both states. A separate dotted tracing can feel like a different design even if it occupies the same space.
- For a sprite that moves between layouts, interpolate to the live target element's width and height, and verify the moving layer is above its target. A fixed aspect-ratio calculation can cause a size jump at docking.
- Treat the faint navbar mark as a placeholder; preserve the hero sprite's opacity through flight and docking so its visual weight does not fade as it arrives.
- For a typewriter label, avoid reserving the longest word's width when adjacent text should follow the cursor. Let the inline text width change with each character.
- A hand-drawn contour can carry the hero’s visual language without constant motion. When the user asks for a calmer project grid, freeze the project outline while keeping the established hero animation.
- When a user simplifies project cards, remove secondary metadata and visual affordances together so the image and title form a coherent link. Keep link feedback on hover and keyboard focus.
- A requested call to action need not look like a pill. Match its treatment to the surrounding type system, and align captions to the actual visible edge of an irregular crop rather than the parent box.
- When a visual experiment reaches a user-selected result, promote the selected values into the actual design tokens and remove the experiment UI and persistence path so the default is stable for everyone.
- When a portfolio contact panel is asked to become a namecard, preserve its direct email action but reduce the content to identity and contact details; let a small brand-specific interaction supply personality.
- When adding a new block below a project grid, inspect the last card's caption-to-block gap as well as the block-to-footer gap. A zero top margin can make a card feel attached to the previous caption even when its internal spacing is generous.
- For a line-to-arrow hover effect, keep the ring and arrow on one continuous path. Move its leading and trailing visible bounds on one reversible timeline so the head leads, the tail follows, and pointer exit naturally rewinds.
- A continuous SVG path can still make an abrupt visual corner when adjacent Bézier segments have different tangents. Choose the ring seam from the destination direction and align the outgoing control point with the ring's ending tangent.
