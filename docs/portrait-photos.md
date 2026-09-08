# Profile photos

The portrait filename is content, not a hardcoded component setting. A profile's
`portrait` frontmatter selects images from the chosen site data directory's
`assets/` folder. Filenames use lowercase letters, digits, and hyphens, with
`.png`, `.jpg`, `.jpeg`, or `.webp` extensions.

## Keep one photo

The existing format continues to work:

```yaml
portrait:
  image: portrait-main.jpg
  alt: A professional headshot.
```

Add the actual image to `assets/portrait-main.jpg`, relative to your site data
directory. It does not need to live in the builder repository. The `source_url`
field is optional provenance metadata for a photo and is not a remote image URL
used by the component.

## Cycle through several photos

Replace the entire `portrait` block with an `images` list in that same profile
file:

```yaml
portrait:
  images:
    - image: portrait-main.jpg
      alt: A professional headshot.
    - image: portrait-speaking.webp
      alt: Presenting investigation findings at a conference.
    - image: portrait-outdoors.jpg
      alt: Taking a break outdoors.
  autoplay: true
  interval_ms: 6000
```

These filenames and descriptions are examples. Add your own photos to `assets/`
and write alt text describing each actual image. List each filename once. Use
either the single-photo fields or the list, not both in the same `portrait`.
A photo's optional `source_url` belongs inside its list item, beside its `image`
and `alt`; remove any old `source_url` directly under `portrait` when converting.

| Setting | Effect |
| --- | --- |
| `images` | Order shown on the site; the first photo appears initially |
| `autoplay: true` | Automatically cycle, with visible Play/Pause controls; default for a list |
| `autoplay: false` | Use buttons or swipe to change photos; no automatic cycling |
| `interval_ms` | Time between automatic changes, in milliseconds; default 6000, range 2000-60000 |

A list containing only one photo behaves like a single portrait. With two or
more, the component loads [Embla Carousel](https://www.embla-carousel.com/docs/v8/get-started/module)
and its [Autoplay plugin](https://www.embla-carousel.com/docs/v8/plugins/autoplay).
These are bundled with the site; they require no account, subscription, or
external image service. The first image is loaded eagerly and subsequent images
use lazy loading. All photos use the existing portrait frame and crop.

Visitors can use previous/next buttons or drag/swipe. Automatic cycling stops
on hover, keyboard focus, dragging, or manual navigation and can be restarted
with Play. It does not announce each automatic change to screen readers.
Reduced-motion preferences disable automatic cycling and make button navigation
instant. Without JavaScript, the first photo remains visible and controls stay
hidden.

## Update your content

1. Pull the builder update with `git pull`.
2. Add the photos to the selected data directory's `assets/` folder.
3. Edit `portrait` in `content/profile/` in that data directory.
4. Run `site-check`, then view with `site-dev`.

The site loads only the selected profile's list. A missing listed file fails
the build with its filename instead of silently substituting another image.
Source images in `assets/` must be suitable for publication, including images
associated with draft content; draft rules do not guarantee image secrecy.
