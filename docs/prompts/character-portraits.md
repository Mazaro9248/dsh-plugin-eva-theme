# 半身线稿生成说明

使用内置 `image_gen` 工具，以旧线稿为风格／角色参考、用户提供的 `images (1).jpeg` 为姿态／构图参考，生成侧身回望的半身透明 PNG；未使用 CLI。项目通过 CSS alpha 蒙版按主题着色，PNG 的透明通道保持工具原始输出。

## 最终提示词集

### 明日香 · asuka-portrait-lineart.png

```text
Use case: style-transfer.
Asset type: transparent monochrome anime line-art portrait used as an alpha mask in a desktop theme.
Input images: Image 1 is the previous character line-art asset, a STYLE and CHARACTER IDENTITY reference only. Image 2 is the user's requested POSE and HALF-LENGTH FRAMING reference only. Recompose the character in Image 1 to match Image 2's upper-body pose.
Primary request: create a side-facing, over-the-shoulder half-length portrait, from the complete top of the hair to the waist only. Match the second image: torso angled sideways, near shoulder visible, head turned toward the viewer's left with one clearly visible eye and a visible side face. Natural relaxed arms extend down to the waist crop. Do NOT use the previous straight rear-view or full-body composition.
Style/medium: clean, confident anime contour drawing. Only BLACK ink lines with antialiased edges on genuine transparent alpha. All spaces between the lines, including face, hair, torso and clothing interiors, must be TRANSPARENT. No white pigment, no solid silhouette, no opaque fills, no shading, no hatching, no paper texture, no colored paint. Moderate detail, smooth legible strokes suitable for scaling to 300 px wide.
Composition/framing: portrait canvas approximately 2:3, one character fills most of frame with 6% clear margins around the full hair silhouette and shoulders; a deliberate waist-level bottom crop. No legs or boots. Do not reproduce the orange background, red dress, cross earring, text, or any backdrop from Image 2. Use the original fully covered plugsuit clothing.
Constraints: exactly one character; neutral expression and natural anatomy, no exaggerated body features, no props, no lettering, no border, no glow. The PNG will be recolored by CSS, so alpha must carry only actual ink contours.
Subject: Asuka Langley from Evangelion, recognizable long twin-tailed hair with her interface hair clips, detailed layered bangs, the classic fully covered Unit 02 pilot plugsuit. Follow the reference pose closely; hair sweeps naturally to the left.
```

### 绫波丽 · rei-portrait-lineart.png

```text
Use case: style-transfer.
Asset type: transparent monochrome anime line-art portrait used as an alpha mask in a desktop theme.
Input images: Image 1 is the previous character line-art asset, a STYLE and CHARACTER IDENTITY reference only. Image 2 is the user's requested POSE and HALF-LENGTH FRAMING reference only. Recompose the character in Image 1 to match Image 2's upper-body pose.
Primary request: create a side-facing, over-the-shoulder half-length portrait, from the complete top of the hair to the waist only. Match the second image: torso angled sideways, near shoulder visible, head turned toward the viewer's left with one clearly visible eye and a visible side face. Natural relaxed arms extend down to the waist crop. Do NOT use the previous straight rear-view or full-body composition.
Style/medium: clean, confident anime contour drawing. Only BLACK ink lines with antialiased edges on genuine transparent alpha. All spaces between the lines, including face, hair, torso and clothing interiors, must be TRANSPARENT. No white pigment, no solid silhouette, no opaque fills, no shading, no hatching, no paper texture, no colored paint. Moderate detail, smooth legible strokes suitable for scaling to 300 px wide.
Composition/framing: portrait canvas approximately 2:3, one character fills most of frame with 6% clear margins around the full hair silhouette and shoulders; a deliberate waist-level bottom crop. No legs or boots. Do not reproduce the orange background, red dress, cross earring, text, or any backdrop from Image 2. Use the original fully covered plugsuit clothing.
Constraints: exactly one character; neutral expression and natural anatomy, no exaggerated body features, no props, no lettering, no border, no glow. The PNG will be recolored by CSS, so alpha must carry only actual ink contours.
Subject: Rei Ayanami from Evangelion, recognizable short layered bob haircut, fine bangs, quiet facial expression, classic fully covered Unit 00 pilot plugsuit. Match the SAME left-facing shoulder turn and waist-up composition as the pose reference, retaining Rei's short hair and suit identity.
```
