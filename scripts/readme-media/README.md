# README's animated calls — the source

`public/video/git-star.gif` is drawn by `star.html` (a canvas, one deterministic frame per `render(t)`) in the visual language of
`public/video/git-fork.gif`: the dark green field `#002400`, the black glowing pill on the left, the button on the right, an arrow
cursor. On the click the star turns gold with a soft flash and three bursts of fireworks; the loop dips to the field and back.
The fork's own source was not kept — only its GIF.

Rebuild (one headless Chrome through its DevTools protocol, 73 frames at 16.67 fps, then one GIF with ffmpeg's palette):

```
node scripts/readme-media/capture.mjs "$PWD/scripts/readme-media/star.html" /tmp/star-frames 16.6667 4.4
ffmpeg -framerate 16.6667 -i /tmp/star-frames/f%03d.png -vf "split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 public/video/git-star.gif
```

Both GIFs are 848×208; README shows them with `width="400"` — GitHub's styles override a `height` attribute, and the image then
stretched to the whole column (the owner, 2026-11-03).
